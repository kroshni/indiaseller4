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
    console.log('Connected to Cassandra');

    // Create services table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS services (
        service_id uuid PRIMARY KEY,
        service_name text,
        description text,
        status text,
        created_at timestamp,
        updated_at timestamp
      )
    `);
    console.log('Services table created');

    // Create index on service name
    await client.execute(`
      CREATE INDEX IF NOT EXISTS services_name_idx ON services (service_name)
    `);
    console.log('Services name index created');

    // Insert sample services
    const sampleServices = [
      {
        service_id: '550e8400-e29b-41d4-a716-446655440010',
        service_name: 'Plumbing',
        description: 'Professional plumbing services',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        service_id: '550e8400-e29b-41d4-a716-446655440011',
        service_name: 'Electrical',
        description: 'Professional electrical services',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        service_id: '550e8400-e29b-41d4-a716-446655440012',
        service_name: 'Carpentry',
        description: 'Professional carpentry services',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        service_id: '550e8400-e29b-41d4-a716-446655440013',
        service_name: 'Painting',
        description: 'Professional painting services',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const service of sampleServices) {
      await client.execute(`
        INSERT INTO services 
        (service_id, service_name, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        service.service_id,
        service.service_name,
        service.description,
        service.status,
        service.created_at,
        service.updated_at
      ], { prepare: true });
    }
    console.log('Sample services inserted');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.shutdown();
    console.log('Connection closed');
  }
}

createServicesTable(); 