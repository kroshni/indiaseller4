const { Client } = require('cassandra-driver');
require('dotenv').config();

async function createServicesTable() {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'indiaseller4'
  });

  try {
    await client.connect();
    
    // Create services table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS services (
        service_id uuid,
        service_name text,
        status text,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (service_id)
      );
    `);

    // Create index on service_name for search functionality
    await client.execute(`
      CREATE INDEX IF NOT EXISTS services_name_idx ON services(service_name);
    `);

    // Create index on status for filtering
    await client.execute(`
      CREATE INDEX IF NOT EXISTS services_status_idx ON services(status);
    `);

    console.log('Services table and indexes created successfully');
  } catch (error) {
    console.error('Error creating services table:', error);
  } finally {
    await client.shutdown();
  }
}

createServicesTable(); 