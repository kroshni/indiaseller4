import { Client, types } from 'cassandra-driver';

if (!process.env.CASSANDRA_CONTACT_POINTS || !process.env.CASSANDRA_LOCAL_DC || !process.env.CASSANDRA_KEYSPACE) {
  throw new Error('Missing required Cassandra environment variables');
}

const client = new Client({
  contactPoints: process.env.CASSANDRA_CONTACT_POINTS.split(','),
  localDataCenter: process.env.CASSANDRA_LOCAL_DC,
  keyspace: process.env.CASSANDRA_KEYSPACE,
});

export const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('Connected to Cassandra database');
  } catch (error) {
    console.error('Error connecting to Cassandra:', error);
    throw error;
  }
};

// Initialize connection
connectToDatabase().catch(console.error);

export { client, types }; 