import { NextRequest, NextResponse } from 'next/server';
import cassandraClient from '@/cassandra/cassandraClient';
import { verifyToken } from '@/lib/jwt';
import { v4 as uuidv4 } from 'uuid';

// GET /api/admin/services
export async function GET(request: NextRequest) {
  let client;
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get connected client
    client = await cassandraClient.getConnectedClient();

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const sortBy = url.searchParams.get('sortBy') || 'service_name';
    const sortOrder = url.searchParams.get('sortOrder') || 'ASC';

    // Build the query based on filters
    let query = 'SELECT * FROM services';
    const params: any[] = [];

    if (search || status) {
      const conditions: string[] = [];
      
      if (search) {
        conditions.push('service_name LIKE ?');
        params.push(`%${search}%`);
      }
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }
      
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add ALLOW FILTERING for non-key columns
    query += ' ALLOW FILTERING';

    const result = await client.execute(query, params, { prepare: true });
    
    // Sort results in memory since Cassandra doesn't support ORDER BY without partition key
    const sortedRows = [...result.rows].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortOrder === 'ASC' ? 
        (aValue > bValue ? 1 : -1) : 
        (aValue < bValue ? 1 : -1);
    });

    // Manual pagination
    const totalItems = sortedRows.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRows = sortedRows.slice(startIndex, endIndex);

    return NextResponse.json({
      services: paginatedRows,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/admin/services
export async function POST(request: NextRequest) {
  let client;
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get connected client
    client = await cassandraClient.getConnectedClient();

    const body = await request.json();
    const { service_name, status } = body;

    // Validate required fields
    if (!service_name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 });
    }

    // Check if service name already exists
    const existingService = await client.execute(
      'SELECT service_name FROM services WHERE service_name = ? ALLOW FILTERING',
      [service_name],
      { prepare: true }
    );

    if (existingService.rows.length > 0) {
      return NextResponse.json({ error: 'Service name already exists' }, { status: 400 });
    }

    // Insert new service
    const service_id = uuidv4();
    const now = new Date();
    await client.execute(
      'INSERT INTO services (service_id, service_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [service_id, service_name, status || 'active', now, now],
      { prepare: true }
    );

    return NextResponse.json({ message: 'Service created successfully', service_id });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/services
export async function PUT(request: NextRequest) {
  let client;
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get connected client
    client = await cassandraClient.getConnectedClient();

    const body = await request.json();
    const { service_id, service_name, status } = body;

    // Validate required fields
    if (!service_id || !service_name) {
      return NextResponse.json({ error: 'Service ID and name are required' }, { status: 400 });
    }

    // Check if service exists
    const existingService = await client.execute(
      'SELECT * FROM services WHERE service_id = ?',
      [service_id],
      { prepare: true }
    );

    if (existingService.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Update service
    await client.execute(
      'UPDATE services SET service_name = ?, status = ?, updated_at = ? WHERE service_id = ?',
      [service_name, status, new Date(), service_id],
      { prepare: true }
    );

    return NextResponse.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/services
export async function DELETE(request: NextRequest) {
  let client;
  try {
    // Verify JWT token
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get connected client
    client = await cassandraClient.getConnectedClient();

    const url = new URL(request.url);
    const service_id = url.searchParams.get('service_id');

    if (!service_id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Delete service
    await client.execute('DELETE FROM services WHERE service_id = ?', [service_id], { prepare: true });

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 