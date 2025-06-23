import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/edge-jwt';
import { cookies } from 'next/headers';
import cassandraClient from '@/cassandra/cassandraClient';
import { types } from 'cassandra-driver';

interface SellerData {
  seller_id: types.Uuid;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  business_type: string;
  gst_number?: string;
  pan_number?: string;
  status: boolean;
  kyc_status: string;
  password_hash?: string;
  addresses?: any[];
  documents?: any[];
  gallery_images?: string[];
  product_categories?: string[];
  service_categories?: string[];
  created_at: Date;
  updated_at: Date;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('seller_token');

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token.value);

    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get connected Cassandra client
    const client = await cassandraClient.getConnectedClient();

    // Fetch seller data from Cassandra using email
    const sellerQuery = 'SELECT * FROM sellers WHERE email = ? ALLOW FILTERING';
    const sellerResult = await client.execute(sellerQuery, [decoded.email], { prepare: true });
    
    console.log('Fetching seller data for email:', decoded.email);
    console.log('Seller query result:', sellerResult.rows);
    
    const seller = sellerResult.rows[0];
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Fetch business details
    const businessQuery = 'SELECT * FROM seller_business_details WHERE seller_id = ?';
    const businessResult = await client.execute(businessQuery, [seller.seller_id], { prepare: true });
    const businessDetails = businessResult.rows[0] || {};

    // Fetch addresses
    const addressesQuery = 'SELECT * FROM seller_addresses WHERE seller_id = ?';
    const addressesResult = await client.execute(addressesQuery, [seller.seller_id], { prepare: true });
    const addresses = addressesResult.rows || [];

    // Fetch documents
    const documentsQuery = 'SELECT * FROM seller_documents WHERE seller_id = ?';
    const documentsResult = await client.execute(documentsQuery, [seller.seller_id], { prepare: true });
    const documents = documentsResult.rows || [];

    // Fetch gallery images
    const galleryQuery = 'SELECT * FROM seller_gallery WHERE seller_id = ?';
    const galleryResult = await client.execute(galleryQuery, [seller.seller_id], { prepare: true });
    const galleryImages = galleryResult.rows.map(img => img.image_url) || [];

    // Fetch seller type
    const typeQuery = 'SELECT * FROM seller_types WHERE seller_id = ?';
    const typeResult = await client.execute(typeQuery, [seller.seller_id], { prepare: true });
    const sellerType = typeResult.rows[0] || {};

    // Fetch seller categories
    const categoriesQuery = 'SELECT * FROM seller_categories WHERE seller_id = ?';
    const categoriesResult = await client.execute(categoriesQuery, [seller.seller_id], { prepare: true });
    const categoryIds = categoriesResult.rows.map(row => row.category_id) || [];

    // Fetch category names if there are any categories
    let categoryNames = [];
    if (categoryIds.length > 0) {
      const categoryNamesQuery = 'SELECT category_id, name FROM categories WHERE category_id IN ?';
      const categoryNamesResult = await client.execute(categoryNamesQuery, [categoryIds], { prepare: true });
      categoryNames = categoryNamesResult.rows.map(row => row.name) || [];
    }

    // Fetch service details
    const servicesQuery = 'SELECT * FROM seller_service_details WHERE seller_id = ?';
    const servicesResult = await client.execute(servicesQuery, [seller.seller_id], { prepare: true });
    const services = servicesResult.rows || [];

    // Combine all data
    const sanitizedSeller = {
      seller_id: seller.seller_id.toString(),
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      status: seller.status,
      kyc_status: seller.kyc_status ? 'verified' : 'pending',
      profile_picture_url: seller.profile_picture_url,
      
      // Business details
      business_name: businessDetails.company_name,
      gst_number: businessDetails.gstin,
      pan_number: businessDetails.pan,
      bank_name: businessDetails.bank_name,
      account_number: businessDetails.account_number,
      ifsc_code: businessDetails.ifsc_code,

      // Seller type
      is_product_seller: sellerType.is_product_seller || false,
      is_service_seller: sellerType.is_service_seller || false,

      // Arrays
      addresses: addresses.map(addr => ({
        address_id: addr.address_id.toString(),
        address_type: addr.address_type,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
        is_default: addr.is_default,
        location_image_url: addr.location_image_url
      })),

      documents: documents.map(doc => ({
        document_type: doc.document_type,
        document_url: doc.document_url
      })),

      gallery_images: galleryImages,
      product_categories: categoryNames,

      services: services.map(service => ({
        service_id: service.service_id.toString(),
        profession: service.profession,
        description: service.description,
        years_experience: service.years_experience,
        available_days: Array.from(service.available_days || []),
        timing_start: service.timing_start,
        timing_end: service.timing_end,
        pricing_type: service.pricing_type,
        pricing_value: service.pricing_value,
        pricing_unit: service.pricing_unit,
        is_onsite: service.is_onsite,
        is_remote: service.is_remote,
        operating_radius: service.operating_radius
      })),

      created_at: seller.created_at,
      updated_at: seller.updated_at
    };

    return NextResponse.json(sanitizedSeller);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
} 