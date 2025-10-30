import { MongoClient, ServerApiVersion } from 'mongodb'

const username = process.env.MONGODB_USER;
const password = process.env.MONGODB_PASS;
const clusterUrl = process.env.MONGODB_CLUSTER;
const appName = process.env.MONGODB_APPNAME;

const uri = `mongodb+srv://${username}:${password}@${clusterUrl}/?appName=${appName}`;

if (!username || !password || !clusterUrl) {
  console.log(username);
  throw new Error('Por favor, defina MONGODB_USER, MONGODB_PASS, e MONGODB_CLUSTER no .env.local');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;