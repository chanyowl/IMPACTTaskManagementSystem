# 🚀 START HERE - Crystell Setup

Your API keys are already configured! Just follow these final steps.

## ✅ What's Already Done

- ✅ Anthropic API key configured in `backend/.env`
- ✅ Firebase config set in `frontend/.env`
- ✅ All code is ready
- ✅ Dependencies installed

## 📋 What You Need to Do (2 steps)

### Step 1: Enable Firestore Database

1. Go to: https://console.firebase.google.com/project/trixie-app-50da6/firestore
2. If you see "Create database", click it
3. Choose **"Start in test mode"**
4. Select a location
5. Click **"Enable"**

📖 Detailed instructions: [ENABLE_FIRESTORE.md](ENABLE_FIRESTORE.md)

### Step 2: Download Firebase Service Account Key

1. Go to: https://console.firebase.google.com/project/trixie-app-50da6/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Save the downloaded JSON file as: `serviceAccountKey.json`
4. Move it to: `backend/serviceAccountKey.json`

📖 Detailed instructions: [GET_FIREBASE_KEY.md](GET_FIREBASE_KEY.md)

## 🎯 Verify Setup

Run this command to check everything is ready:

```bash
node check-setup.js
```

You should see all ✅ green checkmarks!

## 🚀 Run Crystell

Once setup is complete:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

You should see:
```
✅ Firebase Admin initialized successfully
🚀 Crystell backend running on port 3001
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

**Browser:**
Open: http://localhost:5173

## 🎉 First Conversation

Try this as your first message:

> "I need to finish my quarterly report, fix a bug in the payment system, call mom, and go grocery shopping"

Crystell will:
1. Extract all tasks automatically
2. Categorize them (cognitive load, emotional weight)
3. Store them in Firestore
4. Learn your patterns over time
5. Suggest tasks based on your current state

After a few messages, click **"Suggest a Task"** in the sidebar!

## 📚 Documentation

- **QUICKSTART.txt** - Quick reference guide
- **SETUP_GUIDE.md** - Detailed setup instructions
- **README.md** - Full documentation
- **CRYSTELL_PRODUCT_PLAN.md** - Product vision

## 🐛 Troubleshooting

**Backend won't start?**
- Check `serviceAccountKey.json` exists in `backend/` folder
- Verify Firestore is enabled

**"Failed to process chat message"?**
- Make sure backend is running
- Check backend terminal for errors

**Firebase errors?**
- Ensure Firestore is enabled (not just Firebase)
- Verify service account key is valid JSON

## 🔒 Security

Your credentials are safe:
- `.env` files are in `.gitignore`
- `serviceAccountKey.json` is in `.gitignore`
- Never commit these to version control

---

**Need help?** Check the error messages in:
- Backend terminal (server errors)
- Browser console (client errors)
- Firebase Console (database errors)

**Quick Links:**
- Firebase Console: https://console.firebase.google.com/project/trixie-app-50da6
- Firestore Database: https://console.firebase.google.com/project/trixie-app-50da6/firestore
- Service Accounts: https://console.firebase.google.com/project/trixie-app-50da6/settings/serviceaccounts

Let's build something amazing! 🚀
