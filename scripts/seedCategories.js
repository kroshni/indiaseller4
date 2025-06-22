require('dotenv').config();
const { Client } = require('cassandra-driver');
const { v4: uuidv4 } = require('uuid');

const categories = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Books',
  'Sports & Fitness',
  'Beauty & Personal Care',
  'Toys & Games',
  'Automotive',
  'Health & Wellness',
  'Food & Beverages',
  'Art & Crafts',
  'Pet Supplies',
  'Office Supplies',
  'Musical Instruments',
  'Garden & Outdoor'
];

async function seedCategories() {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'indiaseller4'
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra');

    // Create categories table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id uuid,
        name text,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (id)
      )
    `);
    console.log('Categories table created');

    // Create index on name
    await client.execute(`
      CREATE INDEX IF NOT EXISTS ON categories (name)
    `);
    console.log('Index on name created');

    // Insert categories
    for (const categoryName of categories) {
      await client.execute(
        `INSERT INTO categories (id, name, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), categoryName, new Date(), new Date()],
        { prepare: true }
      );
    }

    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await client.shutdown();
    console.log('Connection closed');
  }
}

seedCategories(); 