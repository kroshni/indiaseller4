const { Client } = require('cassandra-driver');

async function main() {
  const client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'indiaseller4'
  });

  try {
    await client.connect();
    console.log('Connected to Cassandra database');

    // Add new columns
    await client.execute('ALTER TABLE sellers ADD status boolean');
    console.log('Added status column');

    await client.execute('ALTER TABLE sellers ADD kyc_status boolean');
    console.log('Added kyc_status column');

    // Set default values for existing rows
    await client.execute('UPDATE sellers SET status = false, kyc_status = false WHERE seller_id IN (SELECT seller_id FROM sellers)');
    console.log('Updated existing rows with default values');

    // Create indices for new columns
    await client.execute('CREATE INDEX IF NOT EXISTS idx_seller_status ON sellers (status)');
    console.log('Created index on status');

    await client.execute('CREATE INDEX IF NOT EXISTS idx_seller_kyc_status ON sellers (kyc_status)');
    console.log('Created index on kyc_status');

    console.log('Successfully updated sellers table schema');
  } catch (err) {
    if (err.code === 9216) { // Already exists error
      console.log('Some columns or indices already exist, continuing...');
    } else {
      console.error('Error updating schema:', err);
      throw err;
    }
  } finally {
    await client.shutdown();
    console.log('Disconnected from Cassandra');
  }
}

main().catch(console.error); 