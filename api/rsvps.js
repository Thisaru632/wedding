const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://fernandoanura192_db_user:Thisaru123@cluster0.f3bzuvg.mongodb.net/?retryWrites=true&w=majority';
let cachedClient = null;

async function getClient() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000
  });
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await getClient();
    const db = client.db('wedding_db');
    const collection = db.collection('rsvps');

    // 1. GET: Fetch all RSVP responses
    if (req.method === 'GET') {
      const docs = await collection.find({}).sort({ _id: -1 }).toArray();
      const rsvps = docs.map(doc => ({
        id: doc._id.toString(),
        name: doc.name || 'Anonymous Guest',
        attendance: doc.attendance || 'accept',
        guests: doc.attendance === 'accept' ? (Number(doc.guests) || 1) : 0,
        message: doc.message || '',
        timestamp: doc.timestamp || (doc.createdAt ? new Date(doc.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently')
      }));
      return res.status(200).json(rsvps);
    }

    // Parse body safely
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    // 2. POST: Submit a new RSVP or Handle Delete / Clear actions
    if (req.method === 'POST') {
      // Check for delete action
      if (body.action === 'delete' && body.id) {
        try {
          await collection.deleteOne({ _id: new ObjectId(body.id) });
        } catch (e) {
          await collection.deleteOne({ id: body.id });
        }
        return res.status(200).json({ success: true, message: 'Deleted successfully' });
      }

      // Check for clearAll action
      if (body.action === 'clearAll') {
        await collection.deleteMany({});
        return res.status(200).json({ success: true, message: 'All cleared' });
      }

      // New RSVP submission
      const newDoc = {
        name: (body.name || '').trim() || 'Guest',
        attendance: body.attendance === 'decline' ? 'decline' : 'accept',
        guests: body.attendance === 'decline' ? 0 : (Number(body.guests) || 1),
        message: (body.message || '').trim(),
        timestamp: body.timestamp || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        createdAt: new Date()
      };

      const result = await collection.insertOne(newDoc);
      return res.status(201).json({
        success: true,
        id: result.insertedId.toString(),
        rsvp: {
          id: result.insertedId.toString(),
          ...newDoc
        }
      });
    }

    // 3. DELETE: Query-param based delete or clear
    if (req.method === 'DELETE') {
      const { id, clearAll } = req.query || {};
      if (clearAll === 'true') {
        await collection.deleteMany({});
        return res.status(200).json({ success: true });
      }
      if (id) {
        try {
          await collection.deleteOne({ _id: new ObjectId(id) });
        } catch (e) {
          await collection.deleteOne({ id: id });
        }
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Missing id or clearAll' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
