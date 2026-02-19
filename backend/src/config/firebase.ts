import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountPath && !serviceAccountJson) {
  console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT_PATH or JSON not set. Firebase will not be initialized.');
  console.warn('   Please download your service account key from Firebase Console and update .env');
} else {
  try {
    let serviceAccount;

    if (serviceAccountJson) {
      // Parse the JSON string from environment variable (Deployment)
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log('✅ Loaded Firebase credentials from environment variable');
    } else if (serviceAccountPath) {
      // Read from file (Local Development)
      serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
      console.log('✅ Loaded Firebase credentials from local file');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

export default admin;
