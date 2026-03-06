#!/usr/bin/env node
/**
 * 🚀 DineGrid Backend Setup - Copy/Paste Ready!
 * 
 * Usage: node setup.js
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║         🚀 DINEGRID BACKEND SETUP - SUPER FAST! 🚀        ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('Choose your setup:\n');
  console.log('1️⃣  QUICK TEST (In-Memory - No Setup)');
  console.log('   └─ Works RIGHT NOW');
  console.log('   └─ Good for testing\n');
  
  console.log('2️⃣  PERMANENT STORAGE (MongoDB - Free)');
  console.log('   └─ 5 minutes setup');
  console.log('   └─ Stores millions of data\n');

  const choice = await ask('Pick 1 or 2: ');

  if (choice.trim() === '1') {
    // Quick test
    console.log('\n🚀 Starting in-memory backend...\n');
    rl.close();
    require('./server-simple.js');
  } else if (choice.trim() === '2') {
    // MongoDB setup
    console.log('\n');
    console.log('════════════════════════════════════════════════════════════');
    console.log('STEP 1: Get MongoDB Connection String (5 minutes)');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log('👉 Open this link in your browser:');
    console.log('   https://www.mongodb.com/cloud/atlas\n');

    console.log('📝 Follow these steps:\n');
    console.log('   1. Click "Create an Account" (FREE - no credit card)');
    console.log('   2. Create a new cluster');
    console.log('   3. In Security → Network Access → Add IP: 0.0.0.0/0');
    console.log('   4. Click Clusters → Connect → Drivers');
    console.log('   5. Copy your connection string');
    console.log('   6. Paste it below\n');

    const connectionString = await ask('📋 Paste your MongoDB connection string:\n> ');

    if (!connectionString.includes('mongodb+srv://')) {
      console.log('\n❌ ERROR: Invalid connection string!');
      console.log('Must start with "mongodb+srv://"\n');
      process.exit(1);
    }

    console.log('\n✅ Validating connection string...');
    
    // Create .env file
    const envContent = `MONGODB_URI=${connectionString.trim()}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SUBHAMDAXXX
PORT=5000
DEBUG=false
`;

    fs.writeFileSync('./setup.env', envContent);
    
    // Update server-db.js to use this env file
    let serverCode = fs.readFileSync('./server-db.js', 'utf8');
    serverCode = serverCode.replace(
      "require('dotenv').config();",
      "require('dotenv').config({path: './setup.env'});"
    );
    fs.writeFileSync('./server-db.js', serverCode);

    console.log('✅ Configuration saved!\n');
    console.log('════════════════════════════════════════════════════════════');
    console.log('🚀 Starting MongoDB Backend!');
    console.log('════════════════════════════════════════════════════════════\n');

    rl.close();
    
    // Start MongoDB server
    require('./server-db.js');
  } else {
    console.log('\n❌ Invalid choice!');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
