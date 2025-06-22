import { Client, types } from 'cassandra-driver';

// Create a singleton client instance
const client = new Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'indiaseller4',
});

// Function to get a connected client
async function getConnectedClient() {
  if (!client.connected) {
    try {
      await client.connect();
      console.log('Connected to Cassandra database');
    } catch (error) {
      console.error('Error connecting to Cassandra:', error);
      throw error;
    }
  }
  return client;
}

// Export everything as a module
const cassandraClient = {
  client,
  types,
  getConnectedClient
};

export default cassandraClient;
export { client, types, getConnectedClient };