import { NextResponse } from 'next/server';
import cassandraClient from '@/cassandra/cassandraClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'name';
    const order = searchParams.get('order') || 'asc';
    const limit = 10;
    const offset = (page - 1) * limit;

    const client = await cassandraClient.getConnectedClient();

    // Build the query based on search parameters
    let query = 'SELECT * FROM sellers';
    const params: any[] = [];

    if (search) {
      // Search in name, email, or company name
      query += ' WHERE name CONTAINS ? OR email CONTAINS ? ALLOW FILTERING';
      params.push(search, search);
    }

    const result = await client.execute(query, params, { prepare: true });
    let sellers = result.rows;

    // Get business details for all sellers
    const businessDetailsQuery = 'SELECT seller_id, company_name FROM seller_business_details';
    const businessDetailsResult = await client.execute(businessDetailsQuery, [], { prepare: true });
    const businessDetails = new Map(
      businessDetailsResult.rows.map((row: any) => [row.seller_id.toString(), row])
    );

    // Combine seller data with business details
    sellers = sellers.map((seller: any) => ({
      ...seller,
      company_name: businessDetails.get(seller.seller_id.toString())?.company_name || '',
    }));

    // Sort results
    sellers = sellers.sort((a: any, b: any) => {
      let aValue = a[sort];
      let bValue = b[sort];

      // Handle special sort cases
      if (sort === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = aValue || '';
        bValue = bValue || '';
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Apply pagination
    const totalSellers = sellers.length;
    sellers = sellers.slice(offset, offset + limit);

    return NextResponse.json({
      sellers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalSellers / limit),
        totalItems: totalSellers,
      },
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { seller_id, status, kyc_status } = await request.json();

    if (!seller_id) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    const client = await cassandraClient.getConnectedClient();

    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (kyc_status !== undefined) {
      updates.push('kyc_status = ?');
      params.push(kyc_status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    updates.push('updated_at = ?');
    params.push(new Date());

    params.push(cassandraClient.types.Uuid.fromString(seller_id));
    const query = `UPDATE sellers SET ${updates.join(', ')} WHERE seller_id = ?`;
    await client.execute(query, params, { prepare: true });

    return NextResponse.json({ message: 'Seller updated successfully' });
  } catch (error) {
    console.error('Error updating seller:', error);
    return NextResponse.json(
      { error: 'Failed to update seller' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { seller_id } = await request.json();

    if (!seller_id) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    const client = await cassandraClient.getConnectedClient();

    // Delete from all related tables
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

    for (const table of tables) {
      const query = `DELETE FROM ${table} WHERE seller_id = ?`;
      await client.execute(query, [cassandraClient.types.Uuid.fromString(seller_id)], { prepare: true });
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