#!/usr/bin/env node

/**
 * DineGrid Setup & Start
 * 
 * Usage:
 * Option 1: node start.js (use in-memory for testing)
 * Option 2: node start.js --mongodb (use MongoDB - need .env file)
 * Option 3: node start.js --setup (guided setup for MongoDB)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const args = process.argv.slice(2);
const mode = args[0] || '--simple';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(q) {
  return new Promise(resolve => rl.question(q, resolve));
}

async function setupMongoDB() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     🚀 DineGrid MongoDB Setup - Quick Start           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('📝 STEPS TO GET YOUR CONNECTION STRING:\n');
  console.log('1. Go to: https://www.mongodb.com/cloud/atlas');
  console.log('2. Click "Create an Account" (FREE - no credit card)');
  console.log('3. Create a cluster named "dinegrid"');
  console.log('4. Click "Connect" → "Drivers" → Copy connection string');
  console.log('5. Paste it below\n');

  const mongoUri = await question('📋 Paste your MongoDB connection string:\n> ');

  if (!mongoUri.includes('mongodb+srv://')) {
    console.log('\n❌ Invalid! Should start with "mongodb+srv://"');
    process.exit(1);
  }

  // Create .env file
  const envContent = `MONGODB_URI=${mongoUri}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SUBHAMDAXXX
PORT=5000
DEBUG=true
`;

  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  console.log('\n✅ Configuration saved to .env');
  console.log('🚀 Starting server with MongoDB...\n');
  
  rl.close();
  startServer('mongodb');
}

function startServer(type) {
  if (type === 'mongodb') {
    // Check if .env exists
    if (!fs.existsSync(path.join(__dirname, '.env'))) {
      console.log('❌ .env file not found!');
      console.log('📝 Run: node start.js --setup\n');
      process.exit(1);
    }

    require('dotenv').config();
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not set in .env');
      process.exit(1);
    }

    console.log('🚀 Starting with MongoDB...');
    require('./server-db.js');
  } else {
    console.log('🚀 Starting with In-Memory Database (Testing Mode)...');
    require('./server-simple.js');
  }
}

async function main() {
  console.log('\n🎯 DineGrid Backend Startup\n');

  if (mode === '--setup') {
    await setupMongoDB();
  } else if (mode === '--mongodb') {
    startServer('mongodb');
  } else {
    // Default: show options
    console.log('Choose your setup:\n');
    console.log('1️⃣  Testing Mode (In-Memory)');
    console.log('   └─ node start.js');
    console.log('   └─ Data lost on restart');
    console.log('   └─ ✅ Works NOW!\n');
    
    console.log('2️⃣  MongoDB (Cloud Permanent Storage)');
    console.log('   └─ node start.js --setup');
    console.log('   └─ Takes 5 minutes');
    console.log('   └─ ✅ Millions of data!\n');

    console.log('3️⃣  MongoDB (Already Configured)');
    console.log('   └─ node start.js --mongodb');
    console.log('   └─ Uses .env file');
    console.log('   └─ ✅ If you already did setup\n');

    const choice = await question('Pick 1, 2, or 3: ');

    if (choice === '1') {
      startServer('simple');
    } else if (choice === '2') {
      await setupMongoDB();
    } else if (choice === '3') {
      startServer('mongodb');
    } else {
      console.log('Invalid choice!');
      process.exit(1);
    }
  }
}

main().catch(console.error);
