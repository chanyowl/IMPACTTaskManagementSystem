# Get Firebase Service Account Key

## Quick Steps:

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com
   - Select your project: **trixie-app-50da6**

2. **Navigate to Service Accounts**
   - Click the **gear icon** (⚙️) next to "Project Overview"
   - Click **Project Settings**
   - Click the **Service Accounts** tab

3. **Generate Key**
   - Click **"Generate New Private Key"** button
   - Click **"Generate Key"** in the confirmation dialog
   - A JSON file will download automatically

4. **Save the File**
   - Rename the downloaded file to: `serviceAccountKey.json`
   - Move it to: `c:\Users\AIPO\Desktop\Anti Gravity First Project\backend\`

   The final path should be:
   ```
   c:\Users\AIPO\Desktop\Anti Gravity First Project\backend\serviceAccountKey.json
   ```

5. **Verify**
   - Run: `node check-setup.js`
   - You should see all ✅ green checkmarks

## Security Warning
⚠️ This file contains sensitive credentials!
- Never commit it to Git (already in .gitignore)
- Never share it publicly
- Keep it secure

## After You Get the Key

Once you have the service account key in place, you're ready to run:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

**Browser:**
```
http://localhost:5173
```

---

Direct link to your Firebase project:
https://console.firebase.google.com/project/trixie-app-50da6/settings/serviceaccounts/adminsdk
