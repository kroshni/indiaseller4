const { Client } = require('cassandra-driver');

async function createCustomerTables() {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'indiaseller4'
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra');

    // Create customers table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id uuid PRIMARY KEY,
        name text,
        email text,
        phone text,
        profile_picture_url text,
        password_hash text,
        status boolean,
        created_at timestamp,
        updated_at timestamp
      )
    `);
    console.log('customers table created');

    // Create index on email
    await client.execute(`
      CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email)
    `);
    console.log('Index on email created');

    // Create customer addresses table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        customer_id uuid,
        address_id uuid,
        address_type text,
        line1 text,
        line2 text,
        city text,
        state text,
        postal_code text,
        country text,
        location_image_url text,
        is_default boolean,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY ((customer_id), address_id)
      )
    `);
    console.log('customer_addresses table created');

    // Create index on is_default
    await client.execute(`
      CREATE INDEX IF NOT EXISTS customer_addresses_default_idx ON customer_addresses (is_default)
    `);
    console.log('Index on is_default created');

    console.log('All customer tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await client.shutdown();
  }
}

createCustomerTables(); 