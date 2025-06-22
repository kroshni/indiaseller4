const { Client } = require('cassandra-driver');

async function initDatabase() {
  // First connect without keyspace to create it
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1'
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra');

    // Create keyspace
    const createKeyspace = `
      CREATE KEYSPACE IF NOT EXISTS indiaseller4
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }`;
    
    await client.execute(createKeyspace);
    console.log('Keyspace created successfully');

    // Switch to the new keyspace
    await client.execute('USE indiaseller4');

    // Create admin_users table
    const createTable = `
      CREATE TABLE IF NOT EXISTS admin_users (
        user_id uuid PRIMARY KEY,
        email text,
        password text,
        role text,
        created_at timestamp,
        updated_at timestamp
      )`;
    
    await client.execute(createTable);
    console.log('Table admin_users created successfully');

    // Create index on email
    const createIndex = `
      CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users (email)`;
    
    await client.execute(createIndex);
    console.log('Index on email created successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.shutdown();
  }
}

initDatabase(); 