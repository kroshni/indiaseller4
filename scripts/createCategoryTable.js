const { Client } = require('cassandra-driver');

async function createCategoryTable() {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'indiaseller4'
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra');

    // Create categories table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id uuid PRIMARY KEY,
        name text,
        slug text,
        description text,
        status text,
        created_at timestamp,
        updated_at timestamp
      )
    `);
    console.log('Categories table created');

    // Create index on slug
    await client.execute(`
      CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug)
    `);
    console.log('Categories slug index created');

    // Insert some sample categories
    const sampleCategories = [
      {
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic gadgets and devices',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing and accessories',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const category of sampleCategories) {
      await client.execute(`
        INSERT INTO categories 
        (category_id, name, slug, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        category.category_id,
        category.name,
        category.slug,
        category.description,
        category.status,
        category.created_at,
        category.updated_at
      ], { prepare: true });
    }
    console.log('Sample categories inserted');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.shutdown();
    console.log('Connection closed');
  }
}

createCategoryTable(); 