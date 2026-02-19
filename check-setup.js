/**
 * Setup Checker for Crystell
 * Run this with: node check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Crystell Setup Checker\n');

let allGood = true;

// Check backend .env
console.log('📦 Backend Configuration:');
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(backendEnvPath)) {
  console.log('  ✅ backend/.env exists');
  const backendEnv = fs.readFileSync(backendEnvPath, 'utf-8');

  if (backendEnv.includes('your_claude_api_key_here')) {
    console.log('  ⚠️  ANTHROPIC_API_KEY not configured (still has placeholder)');
    allGood = false;
  } else if (backendEnv.includes('ANTHROPIC_API_KEY=sk-ant-')) {
    console.log('  ✅ ANTHROPIC_API_KEY appears to be set');
  } else {
    console.log('  ⚠️  ANTHROPIC_API_KEY format looks incorrect');
    allGood = false;
  }
} else {
  console.log('  ❌ backend/.env missing!');
  allGood = false;
}

// Check Firebase service account key
const serviceAccountPath = path.join(__dirname, 'backend', 'serviceAccountKey.json');
if (fs.existsSync(serviceAccountPath)) {
  console.log('  ✅ serviceAccountKey.json exists');
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    if (serviceAccount.type === 'service_account') {
      console.log('  ✅ serviceAccountKey.json appears valid');
    } else {
      console.log('  ⚠️  serviceAccountKey.json format looks incorrect');
      allGood = false;
    }
  } catch (e) {
    console.log('  ❌ serviceAccountKey.json is not valid JSON');
    allGood = false;
  }
} else {
  console.log('  ❌ serviceAccountKey.json missing!');
  console.log('     Download from Firebase Console → Project Settings → Service Accounts');
  allGood = false;
}

// Check backend node_modules
const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
if (fs.existsSync(backendNodeModules)) {
  console.log('  ✅ backend/node_modules exists');
} else {
  console.log('  ❌ backend/node_modules missing! Run: cd backend && npm install');
  allGood = false;
}

console.log('\n📱 Frontend Configuration:');

// Check frontend .env
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
if (fs.existsSync(frontendEnvPath)) {
  console.log('  ✅ frontend/.env exists');
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf-8');

  if (frontendEnv.includes('your_firebase_api_key') || frontendEnv.includes('your-project')) {
    console.log('  ⚠️  Firebase config not set (still has placeholders)');
    allGood = false;
  } else {
    console.log('  ✅ Firebase config appears to be set');
  }
} else {
  console.log('  ❌ frontend/.env missing!');
  allGood = false;
}

// Check frontend node_modules
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');
if (fs.existsSync(frontendNodeModules)) {
  console.log('  ✅ frontend/node_modules exists');
} else {
  console.log('  ❌ frontend/node_modules missing! Run: cd frontend && npm install');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('✨ All checks passed! You\'re ready to run Crystell.\n');
  console.log('Next steps:');
  console.log('  1. Terminal 1: cd backend && npm run dev');
  console.log('  2. Terminal 2: cd frontend && npm run dev');
  console.log('  3. Open browser: http://localhost:5173');
} else {
  console.log('⚠️  Some configuration is missing. Please fix the issues above.\n');
  console.log('See SETUP_GUIDE.md for detailed instructions.');
}

console.log('');
