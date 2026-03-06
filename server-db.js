// server-db.js - Production-ready backend with MongoDB
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load environment variables
try {
  require('dotenv').config();
} catch (e) {
  // dotenv is optional
}

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MONGODB SETUP ====================
// Can use environment variables or hardcoded values

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:password@cluster0.mongodb.net/dinegrid?retryWrites=true&w=majority';

// Admin credentials
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SUBHAMDAXXX';
const ADMIN_TOKEN = 'admin_token_123456789';

// Middleware CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files

// ==================== DATABASE SCHEMAS ====================

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, index: true },
  phone: String,
  state: String,
  type: String,
  createdAt: { type: Date, default: Date.now, index: true }
});

const businessSchema = new mongoose.Schema({
  name: String,
  email: { type: String, index: true },
  phone: String,
  address: String,
  city: String,
  state: String,
  cuisine: String,
  description: String,
  createdAt: { type: Date, default: Date.now, index: true }
});

const loginActivitySchema = new mongoose.Schema({
  email: { type: String, index: true },
  type: String, // 'user' or 'business'
  action: String, // 'signup', 'login', 'register'
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now, index: true }
});

// Create models
const User = mongoose.model('User', userSchema);
const Business = mongoose.model('Business', businessSchema);
const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);

// ==================== DATABASE CONNECTION ====================

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => {
  console.log('\n✅ ================================');
  console.log('🚀 MongoDB Connected Successfully!');
  console.log('================================');
  console.log(`📍 Database: dinegrid`);
  console.log(`📊 Collections: users, businesses, login_activities`);
  console.log('');
})
.catch(err => {
  console.error('\n❌ MongoDB Connection Error:');
  console.error(err.message);
  console.log('\n📝 MongoDB Credentials:');
  console.log('To fix this:');
  console.log('1. Sign up free at https://www.mongodb.com/cloud/atlas');
  console.log('2. Create a cluster');
  console.log('3. Get your connection string');
  console.log('4. Update MONGODB_URI in server-db.js');
  console.log('\n');
});

// ==================== MIDDLEWARE ====================

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

// ==================== AUTHENTICATION ENDPOINTS ====================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password' });
  }
});

// ==================== USER ENDPOINTS ====================

// User Signup - STORES ALL SIGNUP DATA
app.post('/api/signup', async (req, res) => {
  try {
    console.log('📝 New signup:', req.body.email);
    
    const user = new User(req.body);
    await user.save();

    // Log the activity
    await LoginActivity.create({
      email: req.body.email,
      type: 'user',
      action: 'signup',
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({ 
      message: 'User created successfully', 
      user,
      id: user._id 
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== BUSINESS ENDPOINTS ====================

// Business Registration - STORES ALL BUSINESS DATA
app.post('/api/business', async (req, res) => {
  try {
    console.log('🏢 New business registration:', req.body.email);
    
    const business = new Business(req.body);
    await business.save();

    // Log the activity
    await LoginActivity.create({
      email: req.body.email,
      type: 'business',
      action: 'register',
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'Business registered successfully',
      business,
      id: business._id
    });
  } catch (err) {
    console.error('Business registration error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== LOGIN ACTIVITY ENDPOINTS ====================

// Record login/activity
app.post('/api/login-activity', async (req, res) => {
  try {
    const activity = new LoginActivity(req.body);
    activity.ip = req.ip;
    activity.userAgent = req.get('user-agent');
    await activity.save();

    res.status(201).json({ message: 'Login recorded', activity });
  } catch (err) {
    console.error('Login activity error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==================== ADMIN PROTECTED ENDPOINTS ====================

// Get all users with pagination
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      data: users,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error getting users:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all businesses with pagination
app.get('/api/admin/businesses', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const businesses = await Business.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Business.countDocuments();

    res.json({
      data: businesses,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error getting businesses:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all login activities with pagination
app.get('/api/admin/logins', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const logins = await LoginActivity.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginActivity.countDocuments();

    res.json({
      data: logins,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error getting logins:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get statistics
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const totalLogins = await LoginActivity.countDocuments();
    
    // Get stats from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newBusinessesMonth = await Business.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.json({
      totalUsers,
      totalBusinesses,
      totalLogins,
      newUsersMonth,
      newBusinessesMonth,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Error getting stats:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Search users by email
app.get('/api/admin/users/search/:email', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({ email: new RegExp(req.params.email, 'i') }).limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete('/api/admin/users/:id', verifyAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete business
app.delete('/api/admin/businesses/:id', verifyAdmin, async (req, res) => {
  try {
    await Business.findByIdAndDelete(req.params.id);
    res.json({ message: 'Business deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export data as JSON
app.get('/api/admin/export/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/export/businesses', verifyAdmin, async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
  console.log('\n✅ ================================');
  console.log('🚀 Server running successfully!');
  console.log('================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📊 Admin: http://localhost:${PORT}/admin.html`);
  console.log(`\nLogin with:`);
  console.log(`  Username: admin`);
  console.log(`  Password: SUBHAMDAXXX`);
  console.log('\n✨ Data Storage:');
  console.log('  • All signups → Users collection');
  console.log('  • All registrations → Businesses collection');
  console.log('  • All logins → LoginActivity collection');
  console.log('\n📈 Can handle millions of records!\n');
});

module.exports = app;
