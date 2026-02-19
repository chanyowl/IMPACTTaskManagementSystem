# Claude Code Implementation Prompt

## 🎯 Objective

Implement **Phase 1: Core Foundation** of the Task Management System based on the comprehensive architecture analysis from Chan's 122-page architecture document.

---

## 📚 Required Source Documents

**YOU MUST READ THESE FILES FIRST** (in this order):

1. **@ARCHITECTURE_SUMMARY.md** ⭐ **CRITICAL - READ FIRST**
   - Contains all essential architecture requirements from the 122-page PDF
   - Core philosophy: Human-Centric AI principles
   - Ontology rules and mandatory fields
   - Layer 6 AI behavior model
   - Database schema and relationships
   - Success metrics and constraints

2. **@PHASE1_IMPLEMENTATION_PLAN.md**
   - Your primary execution guide
   - Step-by-step implementation instructions
   - File structure and components
   - Success criteria for Phase 1

3. **@TASK_MANAGEMENT_IMPLEMENTATION_PLAN.md**
   - Full system context (all 5 phases)
   - Technology stack decisions
   - Complete verification strategy

4. **@TASK_CHECKLIST.md**
   - Granular task breakdown
   - Use this to track your progress

---

## 🚀 Implementation Instructions

### Step 1: Database Models & Core Ontology

Create the following files with **strict adherence to the architecture**:

#### File: `backend/models/Task.js`

**Requirements from ARCHITECTURE_SUMMARY.md:**
- Implement ALL mandatory fields: `taskId`, `objective`, `assignee`, `startDate`, `dueDate`, `status`, `deliverable`, `evidence`
- Add recommended fields: `version`, `visibility`, `auditLog`, `tags`, `linkedTasks`, `references`
- Status must be enum: `Pending`, `Active`, `Done`
- Include validation for all mandatory fields
- Support soft relationships (tags, links, references)

#### File: `backend/models/Objective.js`

**Requirements:**
- Link to multiple tasks
- Has an owner (required)
- Supports timestamps (createdAt, updatedAt)

#### File: `backend/models/AuditLog.js`

**Requirements from ARCHITECTURE_SUMMARY.md:**
- Fields: `eventId`, `taskId`, `timestamp`, `userId`, `action`, `previousState`, `newState`, `reason`
- **IMMUTABLE** - once created, cannot be modified
- Captures every task mutation

#### File: `backend/core/ontology.js`

**Critical Requirements from ARCHITECTURE_SUMMARY.md:**
- Validate Task → Objective relationship (required)
- Validate Task → Assignee relationship (required)
- Enforce mandatory fields
- Validate status transitions (Pending → Active → Done only)
- Support soft relationship validation
- **MUST prevent invalid data from being saved**

---

### Step 2: Backend Services with Audit Logging

#### File: `backend/services/taskService.js`

**Requirements:**
- CRUD operations: create, read, update, delete
- **Every mutation MUST create an audit log entry**
- Call ontology validation before save
- Support soft relationships (tags, links)
- Return validation errors clearly

**Key Functions:**
```javascript
async createTask(taskData, userId)
async getTask(taskId)
async updateTask(taskId, updates, userId)
async deleteTask(taskId, userId) // soft delete
async listTasks(filters)
async getTaskAuditHistory(taskId)
```

#### File: `backend/services/objectiveService.js`

**Requirements:**
- CRUD for objectives
- Link/unlink tasks
- Audit logging for objective changes

#### File: `backend/services/auditService.js`

**Requirements:**
- Create audit log entries
- Query audit logs (by task, user, date, action)
- Export audit logs
- **Ensure immutability**

#### File: `backend/middleware/validateOntology.js`

**Requirements:**
- Express middleware
- Validates request body against ontology rules
- Returns 400 with clear error messages on validation failure
- Allows request to proceed only if valid

---

### Step 3: API Routes

#### File: `backend/routes/taskRoutes.js`

**Endpoints to implement:**
```
POST   /api/tasks              - Create task (validate ontology first)
GET    /api/tasks              - List tasks (support filters)
GET    /api/tasks/:id          - Get single task
PUT    /api/tasks/:id          - Update task (create audit log)
DELETE /api/tasks/:id          - Delete task (soft delete + audit log)
GET    /api/tasks/:id/audit    - Get task audit history
```

**Requirements:**
- Use `validateOntology` middleware on POST/PUT
- Require authentication (use existing Firebase Auth)
- Return proper HTTP status codes
- Include error handling

#### File: `backend/routes/objectiveRoutes.js`

**Endpoints:**
```
POST   /api/objectives         - Create objective
GET    /api/objectives         - List objectives
GET    /api/objectives/:id     - Get objective details
GET    /api/objectives/:id/tasks - Get all tasks for objective
PUT    /api/objectives/:id     - Update objective
```

#### File: `backend/routes/auditRoutes.js`

**Endpoints:**
```
GET    /api/audit/tasks/:taskId     - Get audit logs for task
GET    /api/audit/users/:userId     - Get audit logs by user
GET    /api/audit/export            - Export audit logs
```

**Update:** `backend/server.js` to register these routes

---

### Step 4: Frontend Components (React)

#### File: `frontend/src/services/taskApi.js`

**API client for all task operations:**
- Use fetch or axios
- Include Firebase Auth token in headers
- Handle errors gracefully
- Return structured responses

**Functions:**
```javascript
createTask(taskData)
getTasks(filters)
getTask(taskId)
updateTask(taskId, updates)
deleteTask(taskId)
getTaskAudit(taskId)
```

#### File: `frontend/src/context/TaskContext.jsx`

**State management using React Context:**
- Store tasks, objectives, current filters
- Provide CRUD functions
- Handle loading/error states
- Real-time updates (optional for Phase 1)

#### File: `frontend/src/components/TaskBoard.jsx`

**Main Kanban board interface:**

**Requirements from ARCHITECTURE_SUMMARY.md:**
- Three columns: **Pending** | **Active** | **Done**
- Drag-and-drop to move tasks between columns
- Filter by assignee, objective, date
- Bulk actions support
- Responsive design

**Features:**
- Display task cards in appropriate columns based on status
- Update task status on drag-and-drop
- Show loading states
- Handle empty states

#### File: `frontend/src/components/TaskCard.jsx`

**Individual task display:**
- Show: objective, assignee, due date, deliverable
- Click to view details
- Quick actions: edit, delete
- Visual indicators for overdue tasks
- Display tags/links

#### File: `frontend/src/components/TaskForm.jsx`

**Create/Edit task form:**

**Critical Requirements from ARCHITECTURE_SUMMARY.md:**
- ALL mandatory fields with validation
- Clear error messages for validation failures
- Objective selector (dropdown)
- Assignee selector
- Date pickers for start/due dates
- Status selector (Pending/Active/Done)
- Deliverable text area
- Evidence upload/link
- Tags input (soft relationship)
- Linked tasks selector (soft relationship)

**Validation:**
- Prevent submission if mandatory fields missing
- Show ontology validation errors from backend
- Highlight invalid fields

#### File: `frontend/src/components/ObjectiveSelector.jsx`

**Dropdown for selecting objectives:**
- Fetch objectives from API
- Searchable/filterable
- Show objective title and description
- Allow creating new objective inline (optional)

#### File: `frontend/src/components/AuditLogViewer.jsx`

**Audit history display:**

**Requirements from ARCHITECTURE_SUMMARY.md:**
- Timeline view of all changes
- Show: timestamp, user, action, before/after states
- Diff view for changes
- Filter by date range, user, action type
- Export capability

**Display:**
- Chronological order (newest first)
- Clear visual distinction between different action types
- Expandable details for each event

---

### Step 5: Integration & Testing

#### File: `backend/tests/task.test.js`

**Unit tests for task service:**
- Test create task with valid data
- Test create task with missing mandatory fields (should fail)
- Test update task creates audit log
- Test delete task (soft delete)
- Test ontology validation

#### File: `backend/tests/ontology.test.js`

**Ontology validation tests:**
- Test mandatory field validation
- Test relationship validation
- Test status transition validation
- Test invalid data rejection

**Manual Testing Checklist:**
1. Create task with all mandatory fields ✓
2. Attempt to create task without objective (should fail) ✓
3. Move task from Pending → Active → Done ✓
4. View audit log showing all changes ✓
5. Edit task and verify audit log captures changes ✓
6. Test soft relationships (tags, links) ✓
7. Filter tasks by assignee/objective ✓

---

## 🎨 Design Guidelines

**From existing project patterns:**
- Follow the styling in existing `frontend/` components
- Use Firebase Auth patterns from existing code
- Match the aesthetic of the current Crystell application
- Ensure responsive design

**Key Principles from ARCHITECTURE_SUMMARY.md:**
- **Transparency Over Magic** - Show validation errors clearly
- **Prevention Over Correction** - Validate during input, not after
- **Flexibility** - Support soft relationships from the start

---

## ✅ Success Criteria (Phase 1)

Before considering Phase 1 complete, verify:

- [x] All mandatory task fields enforced
- [x] Ontology validation prevents invalid data
- [x] Every task mutation creates audit log
- [x] Audit logs are immutable
- [x] Kanban board displays tasks correctly
- [x] Drag-and-drop updates task status
- [x] Task form validates all inputs
- [x] Audit log viewer shows complete history
- [x] API returns proper error messages
- [x] Unit tests pass
- [x] Manual test scenarios complete

---

## 🚨 Critical Constraints

**From ARCHITECTURE_SUMMARY.md - MUST FOLLOW:**

### Mandatory Fields (ALWAYS REQUIRED)
- `taskId`, `objective`, `assignee`, `startDate`, `dueDate`, `status`, `deliverable`, `evidence`

### Ontology Rules (MUST ENFORCE)
- Task MUST link to valid Objective
- Task MUST have valid Assignee
- Status transitions: Pending → Active → Done (no skipping)
- All mandatory fields required before save

### Audit Logging (MUST IMPLEMENT)
- Every create, update, delete creates audit log
- Audit logs are IMMUTABLE
- Capture previousState and newState
- Include userId and timestamp

### What NOT to Implement in Phase 1
- ❌ AI features (Phase 3)
- ❌ Knowledge/SOP module (Phase 2)
- ❌ Advanced permissions (Phase 5)
- ❌ Analytics/reporting (Phase 5)

---

## 📁 Expected File Structure After Implementation

```
backend/
├── models/
│   ├── Task.js ✓
│   ├── Objective.js ✓
│   └── AuditLog.js ✓
├── core/
│   └── ontology.js ✓
├── services/
│   ├── taskService.js ✓
│   ├── objectiveService.js ✓
│   └── auditService.js ✓
├── routes/
│   ├── taskRoutes.js ✓
│   ├── objectiveRoutes.js ✓
│   └── auditRoutes.js ✓
├── middleware/
│   └── validateOntology.js ✓
└── tests/
    ├── task.test.js ✓
    └── ontology.test.js ✓

frontend/src/
├── components/
│   ├── TaskBoard.jsx ✓
│   ├── TaskCard.jsx ✓
│   ├── TaskForm.jsx ✓
│   ├── ObjectiveSelector.jsx ✓
│   └── AuditLogViewer.jsx ✓
├── services/
│   └── taskApi.js ✓
└── context/
    └── TaskContext.jsx ✓
```

---

## 🔄 Implementation Workflow

**Recommended order:**

1. **Backend Foundation** (Day 1-2)
   - Create models (Task, Objective, AuditLog)
   - Implement ontology validation
   - Build services with audit logging
   - Create API routes
   - Test with Postman/curl

2. **Frontend Foundation** (Day 3-4)
   - Create API client
   - Set up TaskContext
   - Build TaskForm with validation
   - Build TaskBoard with columns
   - Build TaskCard component

3. **Integration** (Day 5)
   - Connect frontend to backend
   - Test complete CRUD flow
   - Implement drag-and-drop
   - Add ObjectiveSelector
   - Add AuditLogViewer

4. **Testing & Polish** (Day 6-7)
   - Write unit tests
   - Run manual test scenarios
   - Fix bugs
   - Improve error handling
   - Refine UI/UX

---

## 💡 Tips for Implementation

1. **Start with the models** - Get the data structure right first
2. **Test ontology validation early** - This is critical to the architecture
3. **Audit logging from the start** - Don't add it later
4. **Reference ARCHITECTURE_SUMMARY.md frequently** - It contains all the rules
5. **Use existing Firebase setup** - Don't recreate auth/database config
6. **Follow existing code patterns** - Match the style of the current project

---

## 📞 Questions or Issues?

If you encounter ambiguity or need clarification:
1. Check **ARCHITECTURE_SUMMARY.md** first
2. Reference **PHASE1_IMPLEMENTATION_PLAN.md** for details
3. Look at existing code patterns in the project
4. Ask the user for clarification if still unclear

---

## 🎯 Final Reminder

**This is Phase 1 ONLY** - Focus on building a solid foundation:
- Core task management
- Ontology validation
- Audit logging
- Basic UI

**DO NOT implement:**
- AI features (that's Phase 3)
- Knowledge/SOP module (that's Phase 2)
- Advanced features (that's Phase 4-5)

**Build it right, build it solid, and we'll add the advanced features later.**

---

**Ready to start? Begin with Step 1: Database Models & Core Ontology!** 🚀
