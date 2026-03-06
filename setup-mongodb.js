#!/usr/bin/env node

/**
 * MongoDB Atlas Setup Wizard
 * Run: node setup-mongodb.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   🚀 DineGrid MongoDB Atlas Setup Wizard                  ║');
  console.log('║                                                            ║');
  console.log('║   This will help you set up a free MongoDB database       ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  console.log('📝 Steps to complete:');
  console.log('1. Go to: https://www.mongodb.com/cloud/atlas');
  console.log('2. Click "Create an Account" (FREE)');
  console.log('3. Create a cluster');
  console.log('4. In Security > Network Access, add IP: 0.0.0.0/0');
  console.log('5. Click "Connect" → "Drivers"');
  console.log('6. Copy your connection string\n');

  const mongoUri = await question('📋 Paste your MongoDB connection string:\n>> ');

  if (!mongoUri.includes('mongodb+srv://')) {
    console.log('\n❌ Invalid connection string! Should start with "mongodb+srv://"');
    process.exit(1);
  }

  // Update server-db.js
  const serverPath = path.join(__dirname, 'server-db.js');
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  
  serverContent = serverContent.replace(
    /const MONGODB_URI = process\.env\.MONGODB_URI \|\| '[^']*'/,
    `const MONGODB_URI = '${mongoUri}'`
  );

  fs.writeFileSync(serverPath, serverContent);

  console.log('\n✅ Configuration saved to server-db.js');
  console.log('\n🚀 To start your server, run:');
  console.log('   node server-db.js\n');
  console.log('📊 Admin Dashboard: http://localhost:5000/admin.html');
  console.log('👤 Username: admin');
  console.log('🔑 Password: SUBHAMDAXXX\n');

  rl.close();
}

setup().catch(console.error);
