import { NextResponse } from 'next/server';
import cassandraClient from '@/cassandra/cassandraClient';

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to validate category data
function validateCategory(data: any) {
  const errors: Record<string, string> = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Category name is required';
  }
  
  if (data.status && !['active', 'inactive'].includes(data.status.toLowerCase())) {
    errors.status = 'Status must be either active or inactive';
  }

  return Object.keys(errors).length ? errors : null;
}

// GET - List categories with pagination and search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const client = await cassandraClient.getConnectedClient();
    
    // First get total count for pagination
    const countResult = await client.execute(
      'SELECT COUNT(*) as total FROM categories',
      [],
      { prepare: true }
    );
    const total = countResult.rows[0].total.low || 0; // Handle BigInt
    
    // Then get paginated results
    let query = 'SELECT category_id, name, slug, description, status FROM categories';
    let params = [];
    
    // Add search condition if search term is provided
    if (search) {
      query += ' WHERE name CONTAINS ? ALLOW FILTERING';
      params.push(search);
    }
    
    const result = await client.execute(query, params, { prepare: true });
    
    // Manual pagination since Cassandra doesn't support OFFSET
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRows = result.rows.slice(startIndex, endIndex);
    
    const categories = paginatedRows.map(row => ({
      category_id: row.category_id.toString(),
      name: row.name,
      slug: row.slug,
      description: row.description,
      status: row.status
    }));

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total: result.rows.length,
        totalPages: Math.ceil(result.rows.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const errors = validateCategory(data);
    
    if (errors) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const slug = data.slug?.trim() || generateSlug(data.name);
    const client = await cassandraClient.getConnectedClient();

    // Check if slug already exists
    const existingResult = await client.execute(
      'SELECT slug FROM categories WHERE slug = ? ALLOW FILTERING',
      [slug],
      { prepare: true }
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    const category = {
      category_id: cassandraClient.types.Uuid.random(),
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      status: (data.status || 'active').toLowerCase(),
      created_at: new Date(),
      updated_at: new Date()
    };

    const query = `
      INSERT INTO categories 
      (category_id, name, slug, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await client.execute(query, Object.values(category), { prepare: true });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const errors = validateCategory(data);
    
    if (errors) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    if (!data.category_id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const slug = data.slug?.trim() || generateSlug(data.name);
    const client = await cassandraClient.getConnectedClient();

    // Check if slug already exists for other categories
    const existingResult = await client.execute(
      'SELECT category_id FROM categories WHERE slug = ? ALLOW FILTERING',
      [slug],
      { prepare: true }
    );

    if (existingResult.rows.length > 0 && 
        existingResult.rows[0].category_id.toString() !== data.category_id) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE categories 
      SET name = ?, 
          slug = ?, 
          description = ?, 
          status = ?,
          updated_at = ?
      WHERE category_id = ?
    `;

    const params = [
      data.name.trim(),
      slug,
      data.description?.trim() || null,
      (data.status || 'active').toLowerCase(),
      new Date(),
      cassandraClient.types.Uuid.fromString(data.category_id)
    ];

    await client.execute(query, params, { prepare: true });

    return NextResponse.json({ 
      message: 'Category updated successfully',
      category: { ...data, slug }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const client = await cassandraClient.getConnectedClient();
    await client.execute(
      'DELETE FROM categories WHERE category_id = ?',
      [cassandraClient.types.Uuid.fromString(categoryId)],
      { prepare: true }
    );

    return NextResponse.json({ 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 