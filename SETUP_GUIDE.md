# Quick Setup Guide for Crystell

Follow these steps to get Crystell running on your machine.

## 🚀 Quick Start Checklist

### Step 1: Get Your API Keys

**Anthropic API Key (Claude)**
1. Go to https://console.anthropic.com/settings/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-ant-...`)

**Firebase Project**
1. Go to https://console.firebase.google.com
2. Create a new project (or use existing)
3. Enable **Firestore Database** (Start in test mode for development)

### Step 2: Firebase Service Account Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save the downloaded JSON file as `serviceAccountKey.json`
5. Place it in the `backend/` folder

### Step 3: Firebase Web Config

1. In Firebase Console, go to **Project Settings** → **General**
2. Scroll down to "Your apps" section
3. If no web app exists, click "Add app" and select web (`</>` icon)
4. Copy the config values (apiKey, authDomain, projectId, etc.)

### Step 4: Configure Backend

1. Open `backend/.env` in a text editor
2. Replace `your_claude_api_key_here` with your actual Anthropic API key
3. The file should look like:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
PORT=3001
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### Step 5: Configure Frontend

1. Open `frontend/.env` in a text editor
2. Replace the placeholder values with your Firebase config from Step 3
3. Example:
```
VITE_API_BASE_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-12345
VITE_FIREBASE_STORAGE_BUCKET=my-project-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

### Step 6: Start Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

You should see:
```
✅ Firebase Admin initialized successfully
🚀 Crystell backend running on port 3001
📍 Health check: http://localhost:3001/health
```

### Step 7: Start Frontend Server

Open a **new** terminal (keep backend running) and run:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 8: Open the App

1. Open your browser to `http://localhost:5173`
2. You should see the Crystell onboarding screen
3. Click "Let's get started"
4. Try chatting: "I need to finish my report, call mom, and go grocery shopping"

## ✅ Verification

### Backend Health Check
Open `http://localhost:3001/health` in your browser. You should see:
```json
{"status":"ok","message":"Crystell backend is running"}
```

### Firebase Connection
In the backend terminal, you should see:
```
✅ Firebase Admin initialized successfully
```

In the frontend browser console, you should see:
```
✅ Firebase initialized
```

### Claude API Connection
After sending your first message, check that you get a response from Crystell. If you see an error, double-check your `ANTHROPIC_API_KEY` in `backend/.env`.

## 🐛 Troubleshooting

### "Error initializing Firebase Admin"
- Check that `serviceAccountKey.json` exists in the `backend/` folder
- Verify the file is valid JSON
- Make sure `FIREBASE_SERVICE_ACCOUNT_PATH` in `backend/.env` is correct

### "Failed to process chat message"
- Check that backend server is running
- Verify your `ANTHROPIC_API_KEY` is correct
- Look at the backend terminal for error messages

### "Firebase config not found"
- Check that all `VITE_FIREBASE_*` values are set in `frontend/.env`
- Restart the frontend server after changing `.env` values

### Backend won't start
- Make sure you're in the `backend/` folder
- Check that `node_modules` exists (run `npm install` if not)
- Verify no other app is using port 3001

### Frontend won't start
- Make sure you're in the `frontend/` folder
- Check that `node_modules` exists (run `npm install` if not)
- Verify no other app is using port 5173

## 🎯 Testing the App

Once everything is running, try this conversation flow:

1. **Initial Dump**: "I need to finish my quarterly report, fix a bug in the payment system, call mom, and go grocery shopping"

2. **Wait for Response**: Crystell should acknowledge your tasks

3. **Click "Suggest a Task"**: After a few messages, the button appears in the sidebar

4. **Get Suggestion**: Crystell will suggest a task based on time of day and inferred energy

5. **Provide Feedback**: Try clicking "Start Now", "Not Today", or "Wrong Read" to see how the system learns

## 📁 File Checklist

Make sure these files exist:

```
✅ backend/.env (with your API keys)
✅ backend/serviceAccountKey.json (Firebase credentials)
✅ frontend/.env (with Firebase config)
✅ backend/node_modules/ (run npm install if missing)
✅ frontend/node_modules/ (run npm install if missing)
```

## 🔒 Security Reminder

- Never commit `.env` files to Git
- Never share your API keys publicly
- Keep `serviceAccountKey.json` private
- The `.gitignore` file is already configured to protect these files

## 🎉 Success!

If you can chat with Crystell and receive responses, congratulations! The app is working correctly.

For more details, see the full README.md file.

---

Need help? Check the error messages in:
- Backend terminal (server errors)
- Frontend terminal (build errors)
- Browser console (client errors)
