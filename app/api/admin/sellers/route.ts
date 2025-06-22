import { NextResponse } from 'next/server';
import cassandraClient from '@/cassandra/cassandraClient';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  let client;
  try {
    client = await cassandraClient.getConnectedClient();
    const data = await request.json();

    // Generate seller ID
    const sellerId = cassandraClient.types.Uuid.random();

    // Hash the password
    const hashedPassword = await hash(data.personalDetails.password, 10);

    // Insert seller type
    await client.execute(
      `INSERT INTO seller_types (
        seller_id,
        is_product_seller,
        is_service_seller,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        sellerId,
        data.sellerType.isProductSeller,
        data.sellerType.isServiceSeller,
        new Date(),
        new Date()
      ],
      { prepare: true }
    );

    // Insert seller personal details
    await client.execute(
      `INSERT INTO sellers (
        seller_id,
        name,
        email,
        phone,
        profile_picture_url,
        password_hash,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sellerId,
        data.personalDetails.name,
        data.personalDetails.email,
        data.personalDetails.phone,
        data.personalDetails.profilePictureUrl,
        hashedPassword,
        new Date(),
        new Date()
      ],
      { prepare: true }
    );

    // Insert business details
    await client.execute(
      `INSERT INTO seller_business_details (
        seller_id,
        company_name,
        gstin,
        pan,
        bank_name,
        account_number,
        ifsc_code,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sellerId,
        data.businessDetails.companyName,
        data.businessDetails.gstin,
        data.businessDetails.pan,
        data.businessDetails.bankName,
        data.businessDetails.accountNumber,
        data.businessDetails.ifscCode,
        new Date(),
        new Date()
      ],
      { prepare: true }
    );

    // Insert product details if seller is product-based
    if (data.sellerType.isProductSeller && data.productDetails) {
      // Insert categories
      for (const categoryId of data.productDetails.categories) {
        await client.execute(
          `INSERT INTO seller_categories (
            seller_id,
            category_id,
            created_at
          ) VALUES (?, ?, ?)`,
          [sellerId, cassandraClient.types.Uuid.fromString(categoryId), new Date()],
          { prepare: true }
        );
      }

      // Insert tags
      for (const tag of data.productDetails.tags) {
        await client.execute(
          `INSERT INTO seller_product_tags (
            seller_id,
            tag,
            created_at
          ) VALUES (?, ?, ?)`,
          [sellerId, tag, new Date()],
          { prepare: true }
        );
      }
    }

    // Insert service details if seller is service-based
    if (data.sellerType.isServiceSeller && data.serviceDetails) {
      await client.execute(
        `INSERT INTO seller_service_details (
          seller_id,
          service_id,
          profession,
          description,
          years_experience,
          available_days,
          timing_start,
          timing_end,
          pricing_type,
          pricing_value,
          pricing_unit,
          is_onsite,
          is_remote,
          operating_radius,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sellerId,
          cassandraClient.types.Uuid.fromString(data.serviceDetails.serviceId),
          data.serviceDetails.profession,
          data.serviceDetails.description,
          data.serviceDetails.yearsExperience,
          data.serviceDetails.availableDays,
          data.serviceDetails.timingStart,
          data.serviceDetails.timingEnd,
          data.serviceDetails.pricingType,
          data.serviceDetails.pricingValue,
          data.serviceDetails.pricingUnit,
          data.serviceDetails.isOnsite,
          data.serviceDetails.isRemote,
          data.serviceDetails.operatingRadius,
          new Date(),
          new Date()
        ],
        { prepare: true }
      );

      // Insert certifications
      for (const cert of data.serviceDetails.certifications) {
        await client.execute(
          `INSERT INTO seller_certifications (
            seller_id,
            service_id,
            document_url,
            document_type,
            created_at
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            sellerId,
            cassandraClient.types.Uuid.fromString(data.serviceDetails.serviceId),
            cert.documentUrl,
            cert.documentType,
            new Date()
          ],
          { prepare: true }
        );
      }
    }

    // Insert documents
    for (const doc of data.documents) {
      await client.execute(
        `INSERT INTO seller_documents (
          seller_id,
          document_type,
          document_url,
          created_at
        ) VALUES (?, ?, ?, ?)`,
        [sellerId, doc.documentType, doc.documentUrl, new Date()],
        { prepare: true }
      );
    }

    // Insert addresses
    for (const address of data.addresses) {
      const addressId = cassandraClient.types.Uuid.random();
      await client.execute(
        `INSERT INTO seller_addresses (
          seller_id,
          address_id,
          address_type,
          line1,
          line2,
          city,
          state,
          postal_code,
          country,
          location_image_url,
          is_default,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sellerId,
          addressId,
          address.addressType,
          address.line1,
          address.line2,
          address.city,
          address.state,
          address.postalCode,
          address.country,
          address.locationImageUrl,
          address.isDefault,
          new Date(),
          new Date()
        ],
        { prepare: true }
      );
    }

    // Insert gallery images
    for (const image of data.gallery) {
      const imageId = cassandraClient.types.Uuid.random();
      await client.execute(
        `INSERT INTO seller_gallery (
          seller_id,
          image_id,
          image_url,
          caption,
          created_at
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          sellerId,
          imageId,
          image.imageUrl,
          image.caption,
          new Date()
        ],
        { prepare: true }
      );
    }

    return NextResponse.json({
      message: 'Seller created successfully',
      sellerId: sellerId.toString()
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating seller:', error);
    return NextResponse.json(
      { error: 'Failed to create seller', details: error.message },
      { status: 500 }
    );
  }
} 