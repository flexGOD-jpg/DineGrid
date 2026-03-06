# 🚀 DineGrid Backend Setup Guide

## Overview
This backend is designed to handle **millions of records** with persistent MongoDB storage.

### Data Collections:
- **Users** - All signups from join DineGrid
- **Businesses** - All restaurant/business registrations  
- **LoginActivity** - All login & activity logs

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install express mongoose cors body-parser
```

### Step 2: Get MongoDB Atlas (Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Create an Account" (FREE)
3. Create a cluster
4. Click "Connect" 
5. Choose "Drivers" 
6. Copy your connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/dinegrid?retryWrites=true&w=majority
   ```

### Step 3: Update server-db.js
Replace this line (line 17):
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://user:password@cluster0.mongodb.net/dinegrid?retryWrites=true&w=majority';
```

With YOUR connection string from MongoDB Atlas.

---

## ▶️ Running the Backend

```bash
node server-db.js
```

You should see:
```
✅ ================================
🚀 MongoDB Connected Successfully!
================================
📍 Database: dinegrid
📊 Collections: users, businesses, login_activities
✨ Data Storage:
  • All signups → Users collection
  • All registrations → Businesses collection
  • All logins → LoginActivity collection
📈 Can handle millions of records!
```

---

## 📊 Data Storage Details

### When Users Sign Up (from website)
```javascript
POST /api/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "state": "Maharashtra"
}
// Automatically saved to: Users collection
// Activity logged to: LoginActivity collection
```

### When Businesses Register
```javascript
POST /api/business
{
  "name": "Pizza Palace",
  "email": "pizza@example.com",
  "phone": "9876543210",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "cuisine": "Italian"
}
// Automatically saved to: Businesses collection
// Activity logged to: LoginActivity collection
```

### Admin Dashboard Access
- **URL**: http://localhost:5000/admin.html
- **Username**: admin
- **Password**: SUBHAMDAXXX

Admin can:
- ✅ View all users (with pagination)
- ✅ View all businesses (with pagination)
- ✅ View login activities
- ✅ Get statistics (total records, new records this month)
- ✅ Search users
- ✅ Export data

---

## 🔧 API Endpoints

### Public Endpoints (No Auth Required)
```
POST /api/signup              - Store user signup data
POST /api/business            - Store business registration
POST /api/login-activity      - Log any activity
```

### Admin Endpoints (Requires Token)
```
GET  /api/admin/users              - Get all users (paginated)
GET  /api/admin/businesses         - Get all businesses (paginated)
GET  /api/admin/logins             - Get all login activities (paginated)
GET  /api/admin/stats              - Get statistics
GET  /api/admin/users/search/:email - Search users by email
DELETE /api/admin/users/:id        - Delete a user
DELETE /api/admin/businesses/:id   - Delete a business
GET  /api/admin/export/users       - Export all users as JSON
GET  /api/admin/export/businesses  - Export all businesses as JSON
```

### Pagination
All GET endpoints support:
```
?page=1&limit=100
```

Example:
```
GET /api/admin/users?page=1&limit=50
```

Response:
```json
{
  "data": [...],
  "total": 1000,
  "page": 1,
  "pages": 20
}
```

---

## 📈 Scaling to Millions

MongoDB automatically scales! Here's what makes it efficient:

✅ **Indexes** - Fast queries even with millions of records
- Email is indexed for fast search
- CreatedAt is indexed for date filtering

✅ **Pagination** - Load only what you need (not all records)

✅ **Atlas Features**:
- Auto-scaling (handles traffic spikes)
- Backups (automatic)
- Monitoring (performance insights)
- Free tier includes: 512MB storage, shared cluster

---

## 🔐 Security Notes

### Before Production:
1. Change `ADMIN_PASSWORD` in server-db.js
2. Change `ADMIN_TOKEN` to something random
3. Add authentication for signup/business endpoints
4. Use environment variables for sensitive data

### Use Environment Variables:
```bash
# Create .env file
MONGODB_URI=mongodb+srv://...
ADMIN_PASSWORD=YourSecurePassword
ADMIN_TOKEN=YourRandomToken
PORT=5000
```

Then in server-db.js:
```javascript
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
```

---

## 🆘 Troubleshooting

### Error: Connection refused
- Check if MongoDB Atlas cluster is active
- Verify IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for development)

### Error: Authentication failed
- Check username/password in connection string
- Ensure database user has correct permissions

### Slow queries with large data
- MongoDB Atlas automatically optimizes
- Use pagination to limit results
- Add more specific indexes if needed

---

## 📝 Example: Adding New Fields

To add new fields to User collection:

```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  state: String,
  // ADD NEW FIELDS HERE:
  city: String,
  preferences: String,
  ratings: { type: Number, default: 0 }
});
```

---

## 🎉 You're Ready!

Your backend can now:
✅ Store unlimited data (millions of records)
✅ Query fast with indexing
✅ Scale automatically
✅ Access data from admin dashboard
✅ Export data anytime
✅ Handle millions of users, businesses, and activities

Start collecting data! 🚀
