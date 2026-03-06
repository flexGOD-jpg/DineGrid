#!/usr/bin/env node

/**
 * Test Backend - Add Sample Data
 * Shows how data will be stored from signups, registrations, logins
 * 
 * Run: node test-backend.js
 */

const API_URL = 'http://127.0.0.1:5000';

async function testBackend() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║        🧪 Testing DineGrid Backend                        ║');
  console.log('║                                                            ║');
  console.log('║   This will create sample data to test your backend       ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  try {
    // Test 1: User Signup
    console.log('📝 TEST 1: Creating sample user signup...');
    const userResponse = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Raj Kumar',
        email: 'raj.kumar@example.com',
        phone: '9876543210',
        state: 'Maharashtra',
        type: 'user'
      })
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ User signup stored successfully!');
      console.log('   ID:', userData.user._id);
      console.log('   Email:', userData.user.email);
      console.log('   Saved to: Users collection\n');
    } else {
      throw new Error('User signup failed');
    }

    // Test 2: Business Registration
    console.log('📝 TEST 2: Creating sample business registration...');
    const businessResponse = await fetch(`${API_URL}/api/business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pizza Palace Mumbai',
        email: 'pizza@example.com',
        phone: '9876543211',
        address: '123 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        cuisine: 'Italian'
      })
    });
    
    if (businessResponse.ok) {
      const businessData = await businessResponse.json();
      console.log('✅ Business registration stored successfully!');
      console.log('   ID:', businessData.business._id);
      console.log('   Name:', businessData.business.name);
      console.log('   Saved to: Businesses collection\n');
    } else {
      throw new Error('Business registration failed');
    }

    // Test 3: Login Activity
    console.log('📝 TEST 3: Logging user login activity...');
    const loginResponse = await fetch(`${API_URL}/api/login-activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'raj.kumar@example.com',
        type: 'user',
        action: 'login'
      })
    });
    
    if (loginResponse.ok) {
      console.log('✅ Login activity recorded successfully!');
      console.log('   Saved to: LoginActivity collection\n');
    } else {
      throw new Error('Login activity failed');
    }

    // Test 4: Get Admin Stats (requires token)
    console.log('📝 TEST 4: Fetching admin statistics...');
    const statsResponse = await fetch(`${API_URL}/api/admin/stats`, {
      headers: { 'Authorization': 'Bearer admin_token_123456789' }
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Admin stats retrieved successfully!');
      console.log('   Total Users:', stats.totalUsers);
      console.log('   Total Businesses:', stats.totalBusinesses);
      console.log('   Total Login Activities:', stats.totalLogins);
      console.log('   New Users This Month:', stats.newUsersMonth);
      console.log('   New Businesses This Month:', stats.newBusinessesMonth, '\n');
    } else {
      throw new Error('Stats retrieval failed');
    }

    // Summary
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                  ✅ ALL TESTS PASSED!                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    console.log('📊 YOUR BACKEND CAN STORE:');
    console.log('   ✅ User Signups → Users Collection');
    console.log('   ✅ Business Registrations → Businesses Collection');
    console.log('   ✅ All Login Activities → LoginActivity Collection\n');

    console.log('📈 DATA CAPACITY:');
    console.log('   • Free Plan: 512 MB = ~5 million user records');
    console.log('   • Premium Plan: Unlimited = Handle billions of records\n');

    console.log('🎯 NEXT STEPS:');
    console.log('   1. Login to admin dashboard: http://localhost:5000/admin.html');
    console.log('   2. Username: admin');
    console.log('   3. Password: SUBHAMDAXXX');
    console.log('   4. See your data stored in the tables!\n');

    console.log('🚀 TO GENERATE MILLIONS:');
    console.log('   Each signup/registration = 1 record');
    console.log('   With millions of users = Millions of records stored\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n⚠️  Make sure your backend is running:');
    console.error('   node server-db.js\n');
    process.exit(1);
  }
}

testBackend();
