require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ADMIN CREDENTIALS
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'SUBHAMDAXXX';
const JWT_SECRET = 'your_secret_key_change_this_later';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

const uri = "mongodb+srv://admin:Password123@cluster0.m6phulv.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("dinegrid");
    console.log("✅ MongoDB Atlas connected successfully!");
  } catch (error) {
    console.error("⚠️ Error connecting to MongoDB:", error);
  }
}
connectDB();

// -------------------- MIDDLEWARE --------------------
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.username === ADMIN_USERNAME) next();
    else res.status(403).json({ error: 'Not authorized' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// -------------------- ADMIN LOGIN --------------------
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ username: ADMIN_USERNAME }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// -------------------- USER ENDPOINTS --------------------
app.post('/api/signup', async (req, res) => {
  try {
    const user = { ...req.body, timestamp: new Date() };
    await db.collection('users').insertOne(user);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/business', async (req, res) => {
  try {
    const biz = { ...req.body, timestamp: new Date() };
    await db.collection('businesses').insertOne(biz);
    res.status(201).json({ message: 'Business registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login-activity', async (req, res) => {
  try {
    const login = { ...req.body, timestamp: new Date() };
    await db.collection('logins').insertOne(login);
    res.status(201).json({ message: 'Login recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- ADMIN ENDPOINTS --------------------
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await db.collection('users').find().sort({ timestamp: -1 }).limit(1000).toArray();
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/businesses', verifyAdmin, async (req, res) => {
  try {
    const businesses = await db.collection('businesses').find().sort({ timestamp: -1 }).limit(1000).toArray();
    res.json({ data: businesses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logins', verifyAdmin, async (req, res) => {
  try {
    const logins = await db.collection('logins').find().sort({ timestamp: -1 }).limit(1000).toArray();
    res.json({ data: logins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await db.collection('users').countDocuments();
    const totalBusinesses = await db.collection('businesses').countDocuments();
    const totalLogins = await db.collection('logins').countDocuments();

    res.json({ totalUsers, totalBusinesses, totalLogins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin.html\n`);
});
