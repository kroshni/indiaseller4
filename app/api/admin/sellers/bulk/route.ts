import { NextRequest, NextResponse } from 'next/server';
import { getClient, types } from '@/cassandra/cassandraClient';

export async function PATCH(request: NextRequest) {
  try {
    const { sellerIds, action, value } = await request.json();

    if (!sellerIds || !Array.isArray(sellerIds) || sellerIds.length === 0) {
      return NextResponse.json(
        { error: 'Seller IDs array is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let field;
    switch (action) {
      case 'status':
        field = 'status';
        break;
      case 'kyc_status':
        field = 'kyc_status';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const client = await getClient();

    // Using batch queries for better performance
    const queries = sellerIds.map(id => ({
      query: `UPDATE sellers SET ${field} = ? WHERE seller_id = ?`,
      params: [value, types.Uuid.fromString(id)]
    }));

    await client.batch(queries, { prepare: true });

    return NextResponse.json({
      message: `Successfully updated ${sellerIds.length} sellers`
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sellerIds } = await request.json();

    if (!sellerIds || !Array.isArray(sellerIds) || sellerIds.length === 0) {
      return NextResponse.json(
        { error: 'Seller IDs array is required' },
        { status: 400 }
      );
    }

    const client = await getClient();

    // Tables to clean up
    const tables = [
      'seller_types',
      'sellers',
      'seller_business_details',
      'seller_categories',
      'seller_product_tags',
      'seller_service_details',
      'seller_certifications',
      'seller_documents',
      'seller_addresses',
      'seller_gallery'
    ];

    // Create batch queries for each table
    const allQueries = sellerIds.flatMap(id => 
      tables.map(table => ({
        query: `DELETE FROM ${table} WHERE seller_id = ?`,
        params: [types.Uuid.fromString(id)]
      }))
    );

    // Execute in batches of 100 to avoid overwhelming the database
    for (let i = 0; i < allQueries.length; i += 100) {
      const batchQueries = allQueries.slice(i, i + 100);
      await client.batch(batchQueries, { prepare: true });
    }

    return NextResponse.json({
      message: `Successfully deleted ${sellerIds.length} sellers`
    });
  } catch (error) {
    console.error('Error performing bulk delete:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk delete' },
      { status: 500 }
    );
  }
} 