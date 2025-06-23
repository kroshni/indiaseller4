import { NextResponse } from 'next/server';
import cassandraClient from '@/cassandra/cassandraClient';
import bcrypt from 'bcryptjs';

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
    let query = 'SELECT * FROM customers';
    const params: any[] = [];

    if (search) {
      // Search in name, email, or phone
      query += ' WHERE name CONTAINS ? OR email CONTAINS ? OR phone CONTAINS ? ALLOW FILTERING';
      params.push(search, search, search);
    }

    const result = await client.execute(query, params, { prepare: true });
    let customers = result.rows;

    // Sort results
    customers = customers.sort((a: any, b: any) => {
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
    const totalCustomers = customers.length;
    customers = customers.slice(offset, offset + limit);

    return NextResponse.json({
      customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCustomers / limit),
        totalItems: totalCustomers,
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const client = await cassandraClient.getConnectedClient();

    // Check if email already exists
    const emailCheck = await client.execute(
      'SELECT email FROM customers WHERE email = ? ALLOW FILTERING',
      [data.email],
      { prepare: true }
    );

    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Generate customer ID
    const customerId = cassandraClient.types.Uuid.random();
    const now = new Date();

    // Insert customer
    await client.execute(
      `INSERT INTO customers (
        customer_id,
        name,
        email,
        phone,
        profile_picture_url,
        password_hash,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        data.name,
        data.email,
        data.phone,
        data.profile_picture_url,
        passwordHash,
        data.status,
        now,
        now
      ],
      { prepare: true }
    );

    // Insert addresses
    for (const address of data.addresses) {
      const addressId = cassandraClient.types.Uuid.random();
      await client.execute(
        `INSERT INTO customer_addresses (
          customer_id,
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
          customerId,
          addressId,
          address.address_type,
          address.line1,
          address.line2,
          address.city,
          address.state,
          address.postal_code,
          address.country,
          address.location_image_url,
          address.is_default,
          now,
          now
        ],
        { prepare: true }
      );
    }

    return NextResponse.json({
      message: 'Customer created successfully',
      customer_id: customerId
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 