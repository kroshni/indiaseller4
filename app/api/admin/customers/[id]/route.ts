import { NextResponse } from 'next/server';
import cassandraClient from '@/cassandra/cassandraClient';
import bcrypt from 'bcryptjs';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const client = await cassandraClient.getConnectedClient();

    // Get customer details
    const customerResult = await client.execute(
      'SELECT * FROM customers WHERE customer_id = ?',
      [cassandraClient.types.Uuid.fromString(id)],
      { prepare: true }
    );

    if (customerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const customer = customerResult.rows[0];

    // Get customer addresses
    const addressesResult = await client.execute(
      'SELECT * FROM customer_addresses WHERE customer_id = ?',
      [cassandraClient.types.Uuid.fromString(id)],
      { prepare: true }
    );

    // Remove password hash from response
    delete customer.password_hash;

    return NextResponse.json({
      customer,
      addresses: addressesResult.rows
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const data = await request.json();
    const client = await cassandraClient.getConnectedClient();
    const now = new Date();

    // Check if customer exists
    const customerCheck = await client.execute(
      'SELECT customer_id FROM customers WHERE customer_id = ?',
      [cassandraClient.types.Uuid.fromString(id)],
      { prepare: true }
    );

    if (customerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check email uniqueness if email is being updated
    if (data.email) {
      const emailCheck = await client.execute(
        'SELECT customer_id, email FROM customers WHERE email = ? ALLOW FILTERING',
        [data.email],
        { prepare: true }
      );

      if (emailCheck.rows.length > 0 && emailCheck.rows[0].customer_id.toString() !== id) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    // Update customer
    let updateQuery = 'UPDATE customers SET updated_at = ?';
    const params: any[] = [now];

    // Add fields to update
    if (data.name) {
      updateQuery += ', name = ?';
      params.push(data.name);
    }
    if (data.email) {
      updateQuery += ', email = ?';
      params.push(data.email);
    }
    if (data.phone) {
      updateQuery += ', phone = ?';
      params.push(data.phone);
    }
    if (data.profile_picture_url) {
      updateQuery += ', profile_picture_url = ?';
      params.push(data.profile_picture_url);
    }
    if (data.status !== undefined) {
      updateQuery += ', status = ?';
      params.push(data.status);
    }
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(data.password, salt);
      updateQuery += ', password_hash = ?';
      params.push(passwordHash);
    }

    updateQuery += ' WHERE customer_id = ?';
    params.push(cassandraClient.types.Uuid.fromString(id));

    await client.execute(updateQuery, params, { prepare: true });

    // Handle address updates if provided
    if (data.addresses) {
      // Delete existing addresses
      await client.execute(
        'DELETE FROM customer_addresses WHERE customer_id = ?',
        [cassandraClient.types.Uuid.fromString(id)],
        { prepare: true }
      );

      // Insert new addresses
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
            cassandraClient.types.Uuid.fromString(id),
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
    }

    return NextResponse.json({
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const client = await cassandraClient.getConnectedClient();

    // Check if customer exists
    const customerCheck = await client.execute(
      'SELECT customer_id FROM customers WHERE customer_id = ?',
      [cassandraClient.types.Uuid.fromString(id)],
      { prepare: true }
    );

    if (customerCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Delete customer addresses first (due to foreign key relationship)
    await client.execute(
      'DELETE FROM customer_addresses WHERE customer_id = ?',
      [cassandraClient.types.Uuid.fromString(id)],
      { prepare: true }
    );

    // Delete customer
    await client.execute(
      'DELETE FROM customers WHERE customer_id = ?',
      [cassandraClient.types.Uuid.fromString(id)],
      { prepare: true }
    );

    return NextResponse.json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
} 