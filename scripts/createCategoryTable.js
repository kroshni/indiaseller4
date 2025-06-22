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
    const createTable = `
      CREATE TABLE IF NOT EXISTS categories (
        category_id uuid PRIMARY KEY,
        name text,
        slug text,
        description text,
        status text,
        created_at timestamp,
        updated_at timestamp
      )`;
    
    await client.execute(createTable);
    console.log('Table categories created successfully');

    // Create index on slug for uniqueness checks
    const createSlugIndex = `
      CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug)`;
    
    await client.execute(createSlugIndex);
    console.log('Index on slug created successfully');

    // Create index on name for searching
    const createNameIndex = `
      CREATE INDEX IF NOT EXISTS categories_name_idx ON categories (name)`;
    
    await client.execute(createNameIndex);
    console.log('Index on name created successfully');

  } catch (error) {
    console.error('Error creating category table:', error);
  } finally {
    await client.shutdown();
  }
}

createCategoryTable(); 