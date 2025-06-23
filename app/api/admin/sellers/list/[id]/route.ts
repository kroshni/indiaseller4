import { NextResponse } from 'next/server';
import cassandraClient from '@/cassandra/cassandraClient';
import { use } from 'react';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const client = await cassandraClient.getConnectedClient();
    const sellerId = cassandraClient.types.Uuid.fromString(context.params.id);

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
    const businessDetails = businessResult.rows[0] || {};

    // Fetch seller type
    const typeResult = await client.execute(
      'SELECT * FROM seller_types WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );
    const sellerType = typeResult.rows[0] || {};

    // Fetch product details if product seller
    let productDetails = null;
    if (sellerType.is_product_seller) {
      // Fetch categories
      const categoriesResult = await client.execute(
        'SELECT category_id FROM seller_categories WHERE seller_id = ?',
        [sellerId],
        { prepare: true }
      );

      // Fetch tags
      const tagsResult = await client.execute(
        'SELECT tag FROM seller_product_tags WHERE seller_id = ?',
        [sellerId],
        { prepare: true }
      );

      productDetails = {
        categories: categoriesResult.rows.map(row => row.category_id.toString()),
        tags: tagsResult.rows.map(row => row.tag)
      };
    }

    // Fetch service details if service seller
    let serviceDetails = null;
    if (sellerType.is_service_seller) {
      const serviceResult = await client.execute(
        'SELECT * FROM seller_service_details WHERE seller_id = ?',
        [sellerId],
        { prepare: true }
      );
      const service = serviceResult.rows[0];

      if (service) {
        // Fetch certifications
        const certificationsResult = await client.execute(
          'SELECT * FROM seller_certifications WHERE seller_id = ? AND service_id = ?',
          [sellerId, service.service_id],
          { prepare: true }
        );

        serviceDetails = {
          ...service,
          certifications: certificationsResult.rows
        };
      }
    }

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

    // Fetch gallery
    const galleryResult = await client.execute(
      'SELECT * FROM seller_gallery WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    // Combine all data
    const sellerData = {
      ...seller,
      business_details: businessDetails,
      seller_type: sellerType,
      product_details: productDetails,
      service_details: serviceDetails,
      addresses: addressesResult.rows,
      documents: documentsResult.rows,
      gallery: galleryResult.rows
    };

    return NextResponse.json(sellerData);
  } catch (error) {
    console.error('Error fetching seller details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const client = await cassandraClient.getConnectedClient();
    const data = await request.json();
    const sellerId = cassandraClient.types.Uuid.fromString(id);

    // Update personal details
    await client.execute(
      `UPDATE sellers SET 
        name = ?, 
        email = ?, 
        phone = ?, 
        profile_picture_url = ?,
        status = ?,
        kyc_status = ?,
        updated_at = ?
      WHERE seller_id = ?`,
      [
        data.name,
        data.email,
        data.phone,
        data.profile_picture_url,
        data.status,
        data.kyc_status,
        new Date(),
        sellerId
      ],
      { prepare: true }
    );

    // Update business details
    await client.execute(
      `UPDATE seller_business_details SET 
        company_name = ?, 
        gstin = ?, 
        pan = ?, 
        bank_name = ?, 
        account_number = ?, 
        ifsc_code = ?,
        updated_at = ?
      WHERE seller_id = ?`,
      [
        data.business_details.company_name,
        data.business_details.gstin,
        data.business_details.pan,
        data.business_details.bank_name,
        data.business_details.account_number,
        data.business_details.ifsc_code,
        new Date(),
        sellerId
      ],
      { prepare: true }
    );

    // Update seller type
    await client.execute(
      `UPDATE seller_types SET 
        is_product_seller = ?, 
        is_service_seller = ?,
        updated_at = ?
      WHERE seller_id = ?`,
      [
        data.seller_type.is_product_seller,
        data.seller_type.is_service_seller,
        new Date(),
        sellerId
      ],
      { prepare: true }
    );

    // Handle product details if product seller
    if (data.seller_type.is_product_seller && data.product_details) {
      // Delete existing categories and tags
      await client.execute(
        'DELETE FROM seller_categories WHERE seller_id = ?',
        [sellerId],
        { prepare: true }
      );
      await client.execute(
        'DELETE FROM seller_product_tags WHERE seller_id = ?',
        [sellerId],
        { prepare: true }
      );

      // Insert new categories
      for (const categoryId of data.product_details.categories) {
        await client.execute(
          'INSERT INTO seller_categories (seller_id, category_id, created_at) VALUES (?, ?, ?)',
          [sellerId, cassandraClient.types.Uuid.fromString(categoryId), new Date()],
          { prepare: true }
        );
      }

      // Insert new tags
      for (const tag of data.product_details.tags) {
        await client.execute(
          'INSERT INTO seller_product_tags (seller_id, tag, created_at) VALUES (?, ?, ?)',
          [sellerId, tag, new Date()],
          { prepare: true }
        );
      }
    }

    // Handle service details if service seller
    if (data.seller_type.is_service_seller && data.service_details) {
      // Update service details
      await client.execute(
        `UPDATE seller_service_details SET 
          service_id = ?,
          profession = ?,
          description = ?,
          years_experience = ?,
          available_days = ?,
          timing_start = ?,
          timing_end = ?,
          pricing_type = ?,
          pricing_value = ?,
          pricing_unit = ?,
          is_onsite = ?,
          is_remote = ?,
          operating_radius = ?,
          updated_at = ?
        WHERE seller_id = ?`,
        [
          data.service_details.service_id,
          data.service_details.profession,
          data.service_details.description,
          data.service_details.years_experience,
          data.service_details.available_days,
          data.service_details.timing_start,
          data.service_details.timing_end,
          data.service_details.pricing_type,
          data.service_details.pricing_value,
          data.service_details.pricing_unit,
          data.service_details.is_onsite,
          data.service_details.is_remote,
          data.service_details.operating_radius,
          new Date(),
          sellerId
        ],
        { prepare: true }
      );

      // Update certifications
      await client.execute(
        'DELETE FROM seller_certifications WHERE seller_id = ? AND service_id = ?',
        [sellerId, data.service_details.service_id],
        { prepare: true }
      );

      for (const cert of data.service_details.certifications) {
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
            data.service_details.service_id,
            cert.document_url,
            cert.document_type,
            new Date()
          ],
          { prepare: true }
        );
      }
    }

    // Update addresses
    await client.execute(
      'DELETE FROM seller_addresses WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    for (const address of data.addresses) {
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
          cassandraClient.types.Uuid.fromString(address.address_id),
          address.address_type,
          address.line1,
          address.line2,
          address.city,
          address.state,
          address.postal_code,
          address.country,
          address.location_image_url,
          address.is_default,
          new Date(),
          new Date()
        ],
        { prepare: true }
      );
    }

    // Update documents
    await client.execute(
      'DELETE FROM seller_documents WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    for (const doc of data.documents) {
      await client.execute(
        `INSERT INTO seller_documents (
          seller_id,
          document_type,
          document_url,
          created_at
        ) VALUES (?, ?, ?, ?)`,
        [sellerId, doc.document_type, doc.document_url, new Date()],
        { prepare: true }
      );
    }

    // Update gallery
    await client.execute(
      'DELETE FROM seller_gallery WHERE seller_id = ?',
      [sellerId],
      { prepare: true }
    );

    for (const image of data.gallery) {
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
          cassandraClient.types.Uuid.fromString(image.image_id),
          image.image_url,
          image.caption,
          new Date()
        ],
        { prepare: true }
      );
    }

    return NextResponse.json({ message: 'Seller updated successfully' });
  } catch (error) {
    console.error('Error updating seller:', error);
    return NextResponse.json(
      { error: 'Failed to update seller' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    const client = await cassandraClient.getConnectedClient();
    const sellerId = cassandraClient.types.Uuid.fromString(id);

    // Delete from all related tables
    const tables = [
      'seller_types',
      'seller_business_details',
      'seller_categories',
      'seller_product_tags',
      'seller_service_details',
      'seller_certifications',
      'seller_documents',
      'seller_addresses',
      'seller_gallery',
      'sellers' // Delete from main table last
    ];

    for (const table of tables) {
      await client.execute(
        `DELETE FROM ${table} WHERE seller_id = ?`,
        [sellerId],
        { prepare: true }
      );
    }

    return NextResponse.json({ message: 'Seller deleted successfully' });
  } catch (error) {
    console.error('Error deleting seller:', error);
    return NextResponse.json(
      { error: 'Failed to delete seller' },
      { status: 500 }
    );
  }
} 