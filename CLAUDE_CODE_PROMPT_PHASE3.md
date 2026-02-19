# 🤖 Claude Code Prompt: Phase 3 - AI Integration

## Context

You are implementing **Phase 3** of a Task Management System. Phases 1 and 2 are complete:
- ✅ **Phase 1**: Core task management with ontology validation and audit logging
- ✅ **Phase 2**: Knowledge module with SOPs and templates  
- 🎯 **Phase 3**: AI Integration with Layer 6 behavior model

## Your Mission

Implement AI-assisted task extraction and design proposals using **Google Gemini API**, following the **Layer 6 AI Behavior Model**:

1. **Ask Clarifying Questions** BEFORE designing
2. **Propose Designs/Schemas** BEFORE implementing  
3. **Justify Against Ontology** for all decisions
4. **Provide Review & Validation** layer

### Critical Constraints

❌ **AI MUST NOT**:
- Auto-create tasks without approval
- Guess when information is ambiguous
- Override user decisions
- Hide reasoning or confidence scores
- Bypass ontology validation

✅ **AI MUST**:
- Ask clarifying questions before acting
- Propose designs before implementing
- Flag ambiguity explicitly
- Provide review layer for all outputs
- Respect user's final decision

---

## 📁 Project Structure

```
c:\Users\AIPO\Desktop\Anti Gravity First Project\
├── backend\
│   ├── src\
│   │   ├── config\
│   │   │   └── gemini.ts          ← CREATE: Gemini API setup
│   │   ├── services\
│   │   │   └── aiService.ts       ← CREATE: Core AI logic
│   │   ├── routes\
│   │   │   └── aiRoutes.ts        ← CREATE: AI endpoints
│   │   └── server.ts              ← MODIFY: Add AI routes
│   └── package.json               ← UPDATE: Add @google/generative-ai
├── frontend\
│   └── src\
│       ├── services\
│       │   └── aiApi.ts           ← CREATE: AI API client
│       ├── components\
│       │   └── AIAssistantPanel.tsx  ← CREATE: AI UI
│       └── App.tsx                ← MODIFY: Add AI panel
└── .env                           ← UPDATE: Add GEMINI_API_KEY
```

---

## 🎯 Implementation Steps

### Step 1: Backend Setup

#### 1.1 Install Dependencies

```bash
cd backend
npm install @google/generative-ai
```

#### 1.2 Create `backend/src/config/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 2048,
  },
});

export async function callGemini(prompt: string): Promise<string> {
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
```

#### 1.3 Create `backend/src/services/aiService.ts`

**See full implementation in `phase3_plan.md`** - includes:
- `extractActions()` - Extract tasks from meeting notes
- `proposeTaskDesign()` - Propose complete task structure
- `detectAmbiguity()` - Flag unclear information

**Key Features**:
- Returns proposals with confidence scores (0-1)
- Includes clarifying questions for ambiguous input
- Validates against ontology
- Never auto-creates tasks

#### 1.4 Create `backend/src/routes/aiRoutes.ts`

```typescript
import express from 'express';
import { extractActions, proposeTaskDesign, detectAmbiguity } from '../services/aiService.js';

const router = express.Router();

router.post('/extract-actions', async (req, res) => { /* ... */ });
router.post('/propose-design', async (req, res) => { /* ... */ });
router.post('/detect-ambiguity', async (req, res) => { /* ... */ });

export default router;
```

#### 1.5 Update `backend/src/server.ts`

```typescript
import aiRoutes from './routes/aiRoutes.js';

// Add after other routes
app.use('/api/ai', aiRoutes);
```

#### 1.6 Update `backend/.env`

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get API Key**: https://aistudio.google.com/app/apikey

---

### Step 2: Frontend Implementation

#### 2.1 Create `frontend/src/services/aiApi.ts`

```typescript
const API_BASE = '/api/ai';

export interface AIProposal {
  taskData: {
    objective: string;
    assignee: string;
    startDate: string;
    dueDate: string;
    deliverable: string;
    evidence: string;
    tags?: string[];
  };
  confidence: number;
  reasoning: string;
  questions: string[];
  ambiguities: string[];
}

export interface AIExtractionResult {
  proposals: AIProposal[];
  overallConfidence: number;
  clarifyingQuestions: string[];
  summary: string;
}

export async function extractActions(
  inputText: string,
  context?: any
): Promise<AIExtractionResult> {
  const response = await fetch(`${API_BASE}/extract-actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputText, context })
  });
  
  if (!response.ok) throw new Error('Failed to extract actions');
  const data = await response.json();
  return data.result;
}
```

#### 2.2 Create `frontend/src/components/AIAssistantPanel.tsx`

**See full implementation in `phase3_plan.md`** - includes:
- Text input for meeting notes/documents
- "Extract Actions" button
- Display AI proposals with confidence scores
- Checkbox selection for approval
- Ambiguity warnings
- Clarifying questions display
- "Create Selected Tasks" button

**Key UI Elements**:
- ✨ "Optional - AI Never Auto-Acts" badge
- Confidence percentage for each proposal
- Yellow alerts for ambiguities
- Blue summary box
- Green/red approval indicators

#### 2.3 Update `frontend/src/App.tsx`

Add AI Assistant panel to the main app:

```typescript
import AIAssistantPanel from './components/AIAssistantPanel';

// Add a new tab or section
<div className="ai-section">
  <AIAssistantPanel />
</div>
```

---

## 🧪 Testing Checklist

### Manual Testing

#### Test 1: Action Extraction
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to AI Assistant panel
4. Paste this sample text:
   ```
   Meeting Notes - Feb 6, 2026
   
   John agreed to review the design mockups by Friday.
   Sarah will update the API documentation by next week.
   Mike needs to fix the login bug before the sprint ends.
   ```
5. Click "Extract Actions"
6. **Expected**: 3 task proposals appear with confidence scores
7. **Verify**: Each proposal has reasoning and no auto-creation
8. Select 2 proposals, click "Create Selected Tasks"
9. **Verify**: Only 2 tasks created in task board

#### Test 2: Ambiguity Detection
1. Paste vague text:
   ```
   Someone should probably look at that thing soon.
   ```
2. Click "Extract Actions"
3. **Expected**: AI flags ambiguity with clarifying questions
4. **Verify**: No tasks auto-created, questions shown

#### Test 3: High Confidence
1. Paste clear text:
   ```
   John Smith will complete the user authentication feature by March 1st, 2026.
   The deliverable is a working login system with OAuth support.
   Evidence will be a demo video and deployed staging environment.
   ```
2. Click "Extract Actions"
3. **Expected**: High confidence (>80%) proposal
4. **Verify**: All fields populated, minimal ambiguity

---

## 📋 Acceptance Criteria

Before marking Phase 3 complete, verify:

- [ ] Backend AI service extracts 3-5 tasks from meeting notes
- [ ] All AI proposals require human approval (no auto-creation)
- [ ] Confidence scores displayed (0-100%)
- [ ] Ambiguity flagged with clarifying questions
- [ ] AI reasoning visible for each proposal
- [ ] Users can approve/reject/modify proposals
- [ ] Selected tasks created successfully
- [ ] "AI is optional" messaging visible
- [ ] No errors in console
- [ ] Backend tests pass: `cd backend && npm test`

---

## 🚨 Common Issues & Solutions

### Issue: "GEMINI_API_KEY is not defined"
**Solution**: Add API key to `backend/.env` and restart server

### Issue: "Failed to extract actions"
**Solution**: Check Gemini API quota and network connection

### Issue: AI returns invalid JSON
**Solution**: Improve prompt parsing in `aiService.ts` - add error handling

### Issue: Proposals have low confidence
**Solution**: This is expected for vague input - AI should flag ambiguity

---

## 📚 Reference Documents

- **[phase3_plan.md](file:///C:/Users/AIPO/.gemini/antigravity/brain/b5bad311-5f93-4aa3-b98b-1d59a6e6b123/phase3_plan.md)** - Full implementation details
- **[ARCHITECTURE_SUMMARY.md](file:///c:/Users/AIPO/Desktop/Anti%20Gravity%20First%20Project/ARCHITECTURE_SUMMARY.md)** - Layer 6 AI behavior model
- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs

---

## 🎯 Success Metrics

Phase 3 is successful when:

1. ✅ AI extracts tasks in <30 seconds
2. ✅ Approval rate >70% for clear input
3. ✅ Ambiguity flagged before creation
4. ✅ 100% human approval required
5. ✅ Users understand AI reasoning

---

## 🚀 Getting Started

```bash
# 1. Install backend dependencies
cd backend
npm install @google/generative-ai

# 2. Add Gemini API key to .env
echo "GEMINI_API_KEY=your_key_here" >> .env

# 3. Create the files listed above

# 4. Start backend
npm run dev

# 5. Start frontend (in new terminal)
cd ../frontend
npm run dev

# 6. Test AI Assistant panel
# Navigate to http://localhost:5173 and find AI Assistant
```

---

**Remember**: AI assists but never auto-acts. Users always have the final word! 🤖✨
