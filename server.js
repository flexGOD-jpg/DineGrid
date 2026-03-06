require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ADMIN CREDENTIALS - CHANGE THESE!
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'SUBHAMDAXXX'; // Change this to your own password
const JWT_SECRET = 'your_secret_key_change_this'; // Change this!

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files

// MongoDB connection (using cloud MongoDB Atlas URI from .env)
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.log('⚠️ MongoDB not running. Install MongoDB or use MongoDB Atlas');
    console.log('For now, data will be stored in memory only');
  });

// -------------------- SCHEMAS --------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  state: String,
  type: String,
  timestamp: { type: Date, default: Date.now }
});

const businessSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  state: String,
  timestamp: { type: Date, default: Date.now }
});

const loginSchema = new mongoose.Schema({
  email: String,
  type: String,
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Business = mongoose.model('Business', businessSchema);
const Login = mongoose.model('Login', loginSchema);

// -------------------- MIDDLEWARE - Verify Admin --------------------
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.username === ADMIN_USERNAME) {
      next();
    } else {
      res.status(403).json({ error: 'Not authorized' });
    }
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
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/business', async (req, res) => {
  try {
    const biz = new Business(req.body);
    await biz.save();
    res.status(201).json({ message: 'Business registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login-activity', async (req, res) => {
  try {
    const login = new Login(req.body);
    await login.save();
    res.status(201).json({ message: 'Login recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- ADMIN PROTECTED ENDPOINTS --------------------
// Get all users (ADMIN ONLY)
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ timestamp: -1 }).limit(1000);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all businesses (ADMIN ONLY)
app.get('/api/admin/businesses', verifyAdmin, async (req, res) => {
  try {
    const businesses = await Business.find().sort({ timestamp: -1 }).limit(1000);
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all logins (ADMIN ONLY)
app.get('/api/admin/logins', verifyAdmin, async (req, res) => {
  try {
    const logins = await Login.find().sort({ timestamp: -1 }).limit(1000);
    res.json(logins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user count (ADMIN ONLY)
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const businessCount = await Business.countDocuments();
    const loginCount = await Login.countDocuments();

    res.json({
      totalUsers: userCount,
      totalBusinesses: businessCount,
      totalLogins: loginCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (ADMIN ONLY)
app.delete('/api/admin/user/:id', verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`\n⚙️  IMPORTANT: Change ADMIN_PASSWORD in server.js!\n`);
});