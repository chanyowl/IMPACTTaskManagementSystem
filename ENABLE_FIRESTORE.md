# Enable Firestore Database

Before running Crystell, you need to make sure Firestore is enabled in your Firebase project.

## Quick Steps:

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com/project/trixie-app-50da6

2. **Navigate to Firestore**
   - In the left sidebar, click **"Firestore Database"**
   - Or click **"Build"** → **"Firestore Database"**

3. **Create Database (if not already created)**
   - Click **"Create database"** button

4. **Choose Security Rules**
   - Select **"Start in test mode"** (for development)
   - This allows read/write access for testing
   - ⚠️ Note: Test mode rules expire after 30 days

5. **Choose Location**
   - Select a location close to you (e.g., us-central, europe-west)
   - Click **"Enable"**

6. **Wait for Setup**
   - Firestore will take a few seconds to initialize
   - Once ready, you'll see the Firestore console

## Update Security Rules (Important for Production)

For now, test mode is fine. But for production, update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users (development only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, you should add proper authentication and restrict access.

## Verify Firestore is Working

After enabling Firestore and getting your service account key:

1. Run the backend: `cd backend && npm run dev`
2. You should see: **"✅ Firebase Admin initialized successfully"**
3. No errors about Firestore permissions

## Collections That Will Be Created

When you start using Crystell, these collections will be automatically created:

- **users** - User profiles and preferences
- **tasks** - User tasks with metadata
- **interactions** - Chat conversation history

You can view these in the Firebase Console under Firestore Database.

---

Direct link: https://console.firebase.google.com/project/trixie-app-50da6/firestore
