# Crystell - Your Thoughtful Task Companion

Crystell is a conversational AI app that learns your personality and work style to suggest tasks based on your current psychological and energetic state. Unlike traditional productivity tools, Crystell focuses on **who you are** to help decide **what you should do**.

## Core Principles

- **Inference over Interrogation**: Learns your patterns naturally through conversation, no personality tests
- **Low Pressure**: Suggests what fits your current energy, never what you "should" do
- **The Mirror**: Helps you recognize your own patterns and tendencies
- **Chat-First**: Primary interface is conversational, not dashboards

## Features

- 🤖 AI-powered conversational interface using Claude API
- 📝 Automatic task extraction from freeform text
- 🧠 User state inference (energy levels, sentiment, time-of-day patterns)
- 🎯 Smart task recommendations based on current state
- 📊 Pattern recognition over time
- 🔄 Real-time Firebase sync
- 🎨 Clean, minimal UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Firebase SDK for real-time data
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript for type safety
- Claude API (Anthropic) for AI capabilities
- Firebase Admin SDK for Firestore operations
- RESTful API architecture

### Database
- Firebase Firestore (real-time NoSQL database)

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **Anthropic API key** for Claude (sign up at https://console.anthropic.com)
- **Firebase project** with Firestore enabled (create at https://console.firebase.google.com)
- **Firebase service account key** downloaded

## Setup Instructions

### 1. Clone or Navigate to the Project

```bash
cd "c:\Users\AIPO\Desktop\Anti Gravity First Project"
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable **Firestore Database** (Start in test mode for development)
4. Download service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in the `backend/` folder
5. Get web app config:
   - Go to Project Settings → General → Your apps
   - Copy the Firebase configuration values

### 3. Backend Setup

```bash
cd backend

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and add your values:
# ANTHROPIC_API_KEY=your_actual_claude_api_key
# PORT=3001
# NODE_ENV=development
# FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Place your serviceAccountKey.json in the backend folder

# Install dependencies (already done if you've been following along)
npm install

# Start the development server
npm run dev
```

The backend should now be running on `http://localhost:3001`

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and add your Firebase config:
# VITE_API_BASE_URL=http://localhost:3001
# VITE_FIREBASE_API_KEY=your_firebase_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your-project-id
# VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
# VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
# VITE_FIREBASE_APP_ID=your_app_id

# Install dependencies (already done if you've been following along)
npm install

# Start the development server
npm run dev
```

The frontend should now be running on `http://localhost:5173`

### 5. Test the Application

1. Open your browser to `http://localhost:5173`
2. You should see the Crystell onboarding screen
3. Click "Let's get started"
4. Start chatting! Try: "I need to finish my quarterly report, call mom, fix a bug in the payment system, and go grocery shopping"
5. After a few messages, click "Suggest a Task" to get personalized recommendations

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Firebase configuration
│   │   ├── models/          # TypeScript interfaces
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   │   ├── aiService.ts            # Claude API integration
│   │   │   ├── firebaseService.ts      # Firestore operations
│   │   │   ├── taskParser.ts           # Task extraction
│   │   │   ├── userStateService.ts     # State inference
│   │   │   └── recommendationService.ts # Task suggestions
│   │   └── server.ts        # Express app entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── TaskSuggestionCard.tsx
│   │   │   └── OnboardingFlow.tsx
│   │   ├── pages/           # Page components
│   │   │   └── ChatPage.tsx
│   │   ├── services/        # API services
│   │   │   └── api.ts
│   │   ├── types/           # TypeScript types
│   │   └── config/          # Firebase client config
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## API Endpoints

### Chat
- `POST /api/chat` - Send a message to Crystell

### Tasks
- `POST /api/tasks/extract` - Extract tasks from text
- `GET /api/tasks` - Get user's tasks (with optional status filter)
- `GET /api/tasks/suggest` - Get task suggestion based on current state
- `POST /api/tasks/:id/feedback` - Submit feedback (accept/snooze/wrong_read)
- `PATCH /api/tasks/:id` - Update a task

### Profile
- `GET /api/profile/:userId` - Get user profile
- `PATCH /api/profile/:userId` - Update user profile

## How It Works

### 1. Task Extraction
When you describe tasks in conversation, Claude API parses them into structured objects with:
- Description
- Inferred tags (creative, admin, social, etc.)
- Cognitive load (high/low)
- Emotional weight (scary/neutral)

### 2. User State Inference
The system analyzes:
- Response latency (quick = high energy, slow = low energy)
- Sentiment analysis (positive/negative language patterns)
- Time of day patterns
- Historical behavior

### 3. Task Recommendation
Matches tasks to your current state:
- High energy + morning → High cognitive load tasks
- Low energy + afternoon → Low cognitive load tasks
- Positive sentiment → Can handle scary tasks
- Negative sentiment → Stick to comfortable tasks

### 4. Learning Loop
- User accepts/snoozes tasks → System updates resistance scores
- "Wrong Read" feedback → Helps AI refine understanding
- Pattern recognition after 3+ days of usage

## Development

### Backend Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled production build
```

### Frontend Scripts
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Environment Variables

### Backend
- `ANTHROPIC_API_KEY` - Your Claude API key (required)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to service account JSON

### Frontend
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_FIREBASE_*` - Firebase configuration values

## Troubleshooting

### Backend won't start
- Check that your `ANTHROPIC_API_KEY` is set correctly in `backend/.env`
- Ensure `serviceAccountKey.json` exists in the `backend/` folder
- Verify Firebase project is set up correctly

### Frontend can't connect to backend
- Make sure backend is running on port 3001
- Check that `VITE_API_BASE_URL` in `frontend/.env` is correct
- Open browser console to see error messages

### Firebase errors
- Verify Firestore is enabled in Firebase Console
- Check that service account key has correct permissions
- Ensure Firebase config values in frontend `.env` are correct

### "No tasks available" message
- Make sure you've told Crystell about some tasks first
- Try describing tasks in natural language: "I need to..."
- Check Firebase Console to see if tasks are being saved

## Security Notes

- Never commit `.env` files or `serviceAccountKey.json` to version control
- Keep your API keys secret
- For production, set up proper Firebase security rules
- Use Firebase Authentication for multi-user support

## Future Enhancements (Out of MVP Scope)

- Mobile app (React Native)
- Voice input
- Calendar integration
- Wearable health data integration
- Vector database for semantic search
- Multi-user authentication
- Production deployment configuration

## License

ISC

## Support

For issues, questions, or suggestions, please refer to the project plan document: `CRYSTELL_PRODUCT_PLAN.md`

---

Built with ❤️ using Claude API, React, and Firebase
