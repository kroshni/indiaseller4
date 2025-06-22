const { Client } = require('cassandra-driver');

async function createSellerTables() {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'indiaseller4'
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra');

    // Create seller_types table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_types (
        seller_id uuid,
        is_product_seller boolean,
        is_service_seller boolean,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (seller_id)
      )
    `);
    console.log('seller_types table created');

    // Create sellers table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS sellers (
        seller_id uuid,
        name text,
        email text,
        phone text,
        profile_picture_url text,
        password_hash text,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (seller_id)
      )
    `);
    console.log('sellers table created');

    // Create index on email
    await client.execute(`
      CREATE INDEX IF NOT EXISTS ON sellers (email)
    `);
    console.log('Index on email created');

    // Create seller_business_details table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_business_details (
        seller_id uuid,
        company_name text,
        gstin text,
        pan text,
        bank_name text,
        account_number text,
        ifsc_code text,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (seller_id)
      )
    `);
    console.log('seller_business_details table created');

    // Create seller_categories table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_categories (
        seller_id uuid,
        category_id uuid,
        created_at timestamp,
        PRIMARY KEY (seller_id, category_id)
      )
    `);
    console.log('seller_categories table created');

    // Create seller_product_tags table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_product_tags (
        seller_id uuid,
        tag text,
        created_at timestamp,
        PRIMARY KEY (seller_id, tag)
      )
    `);
    console.log('seller_product_tags table created');

    // Create seller_service_details table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_service_details (
        seller_id uuid,
        service_id uuid,
        profession text,
        description text,
        years_experience int,
        available_days set<text>,
        timing_start text,
        timing_end text,
        pricing_type text,
        pricing_value decimal,
        pricing_unit text,
        is_onsite boolean,
        is_remote boolean,
        operating_radius int,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (seller_id, service_id)
      )
    `);
    console.log('seller_service_details table created');

    // Create seller_certifications table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_certifications (
        seller_id uuid,
        service_id uuid,
        document_url text,
        document_type text,
        created_at timestamp,
        PRIMARY KEY (seller_id, service_id, document_url)
      )
    `);
    console.log('seller_certifications table created');

    // Create seller_documents table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_documents (
        seller_id uuid,
        document_type text,
        document_url text,
        created_at timestamp,
        PRIMARY KEY (seller_id, document_type, document_url)
      )
    `);
    console.log('seller_documents table created');

    // Create seller_addresses table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_addresses (
        seller_id uuid,
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
        PRIMARY KEY (seller_id, address_id)
      )
    `);
    console.log('seller_addresses table created');

    // Create seller_gallery table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS seller_gallery (
        seller_id uuid,
        image_id uuid,
        image_url text,
        caption text,
        created_at timestamp,
        PRIMARY KEY (seller_id, image_id)
      )
    `);
    console.log('seller_gallery table created');

    // Create indices for efficient querying
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_seller_email ON sellers (email)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_seller_phone ON sellers (phone)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_seller_company ON seller_business_details (company_name)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_seller_gstin ON seller_business_details (gstin)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_seller_pan ON seller_business_details (pan)`);
    console.log('Indices created');

    console.log('All tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  } finally {
    await client.shutdown();
    console.log('Connection closed');
  }
}

createSellerTables(); 