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

    // Get all seller IDs
    const result = await client.execute('SELECT seller_id FROM sellers');
    const sellers = result.rows;
    
    console.log(`Found ${sellers.length} sellers to update`);

    // Update each seller with default values
    let updated = 0;
    for (const seller of sellers) {
      await client.execute(
        'UPDATE sellers SET status = ?, kyc_status = ? WHERE seller_id = ?',
        [false, false, seller.seller_id],
        { prepare: true }
      );
      updated++;
      if (updated % 10 === 0) {
        console.log(`Updated ${updated} sellers...`);
      }
    }
    console.log(`Successfully updated ${updated} sellers with default values`);

    // Verify indices exist
    try {
      await client.execute('CREATE INDEX IF NOT EXISTS idx_seller_status ON sellers (status)');
      console.log('Verified status index exists');
    } catch (err) {
      console.log('Status index already exists');
    }

    try {
      await client.execute('CREATE INDEX IF NOT EXISTS idx_seller_kyc_status ON sellers (kyc_status)');
      console.log('Verified KYC status index exists');
    } catch (err) {
      console.log('KYC status index already exists');
    }

  } catch (err) {
    console.error('Error updating sellers:', err);
    throw err;
  } finally {
    await client.shutdown();
    console.log('Disconnected from Cassandra');
  }
}

main().catch(console.error); 