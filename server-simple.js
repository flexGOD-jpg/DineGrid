// server-simple.js - Simple version without MongoDB (for testing)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'SUBHAMDAXXX';
const ADMIN_TOKEN = 'admin_token_123456789';

// In-memory storage (will clear when server restarts)
let users = [];
let businesses = [];
let logins = [];

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files

// Middleware - Verify Admin
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (token === ADMIN_TOKEN) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized' });
  }
};

// ==================== API ENDPOINTS ====================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password' });
  }
});

// User Signup
app.post('/api/signup', (req, res) => {
  try {
    const user = {
      ...req.body,
      _id: Date.now().toString(),
      timestamp: new Date()
    };
    users.push(user);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Business Registration
app.post('/api/business', (req, res) => {
  try {
    const business = {
      ...req.body,
      _id: Date.now().toString(),
      timestamp: new Date()
    };
    businesses.push(business);
    res.status(201).json({ message: 'Business registered successfully', business });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Activity
app.post('/api/login-activity', (req, res) => {
  try {
    const login = {
      ...req.body,
      _id: Date.now().toString(),
      timestamp: new Date()
    };
    logins.push(login);
    res.status(201).json({ message: 'Login recorded', login });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ADMIN PROTECTED ENDPOINTS ====================

// Get all users
app.get('/api/admin/users', verifyAdmin, (req, res) => {
  try {
    const sortedUsers = [...users].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sortedUsers.slice(0, 1000));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all businesses
app.get('/api/admin/businesses', verifyAdmin, (req, res) => {
  try {
    const sortedBusinesses = [...businesses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sortedBusinesses.slice(0, 1000));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all logins
app.get('/api/admin/logins', verifyAdmin, (req, res) => {
  try {
    const sortedLogins = [...logins].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sortedLogins.slice(0, 1000));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get statistics
app.get('/api/admin/stats', verifyAdmin, (req, res) => {
  try {
    res.json({
      totalUsers: users.length,
      totalBusinesses: businesses.length,
      totalLogins: logins.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete('/api/admin/user/:id', verifyAdmin, (req, res) => {
  try {
    users = users.filter(u => u._id !== req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('\n✅ ================================');
  console.log('🚀 Server running successfully!');
  console.log('================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📊 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`\nLogin with:`);
  console.log(`  Username: admin`);
  console.log(`  Password: SUBHAMDAXXX`);
  console.log('\n⚠️  Note: Data is stored in memory (clears on server restart)');
  console.log('To save data permanently, install MongoDB\n');
});
