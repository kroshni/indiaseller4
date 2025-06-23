import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/edge-jwt';
import { cookies } from 'next/headers';
import cassandraClient from '@/cassandra/cassandraClient';
import { types } from 'cassandra-driver';

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
    const sellerId = types.Uuid.fromString(decoded.userId);

    // Fetch seller details
    const sellerResult = await client.execute(
      'SELECT * FROM sellers WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    const seller = sellerResult.rows[0];
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Fetch business details
    const businessResult = await client.execute(
      'SELECT * FROM seller_business_details WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );
    const business = businessResult.rows[0] || {};

    // Fetch addresses
    const addressesResult = await client.execute(
      'SELECT * FROM seller_addresses WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    // Fetch documents
    const documentsResult = await client.execute(
      'SELECT * FROM seller_documents WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    // Fetch gallery images
    const galleryResult = await client.execute(
      'SELECT * FROM seller_gallery WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    // Fetch seller type
    const typeResult = await client.execute(
      'SELECT * FROM seller_types WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );
    const sellerType = typeResult.rows[0] || {};

    // Fetch seller categories
    const categoriesResult = await client.execute(
      'SELECT * FROM seller_categories WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    // Combine all data
    const profile = {
      seller_id: seller.seller_id.toString(),
      name: seller.name,
      email: seller.email,
      phone: seller.phone,
      status: seller.status || false,
      kyc_status: seller.kyc_status ? 'Verified' : 'Pending',
      business_name: business.company_name,
      business_type: sellerType.is_product_seller ? 'Product Seller' : 'Service Provider',
      gst_number: business.gstin,
      pan_number: business.pan,
      addresses: addressesResult.rows.map(addr => ({
        address_id: addr.address_id.toString(),
        address_type: addr.address_type,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
        is_default: addr.is_default || false
      })),
      documents: documentsResult.rows.map(doc => ({
        document_id: doc.document_type,
        document_type: doc.document_type,
        document_url: doc.document_url,
        status: 'Verified' // You might want to add a status field in your schema
      })),
      gallery_images: galleryResult.rows.map(img => img.image_url),
      product_categories: categoriesResult.rows.map(cat => cat.category_id.toString()),
      service_categories: [], // Add this if you have a separate table for service categories
      created_at: seller.created_at?.toISOString(),
      updated_at: seller.updated_at?.toISOString()
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
} 