# Phase 2: Knowledge & SOP Module - Implementation Plan

## Overview

Phase 2 builds the **Knowledge & SOP (Standard Operating Procedures) Module** to preserve institutional memory and enable knowledge reuse across the organization.

**Timeline**: Week 3-4  
**Goal**: Searchable knowledge base with SOPs, templates, and task linking

---

## Why This Matters (From Architecture)

> **"Institutional Memory Preserved"**

The architecture emphasizes that knowledge should survive team turnover and enable:
- Reduced onboarding time (40% target)
- Consistent task execution
- Reusable best practices
- Template-based workflows

---

## Phase 2 Features

### Core Capabilities

1. **SOP Management**
   - Create, edit, archive SOPs
   - Version control (immutable history)
   - Category organization
   - Rich markdown content

2. **Template Library**
   - Task templates from SOPs
   - Quick task creation from templates
   - Template customization

3. **Knowledge Search**
   - Full-text search across SOPs
   - Filter by category, tags, status
   - Search within content

4. **Task Integration**
   - Link SOPs to tasks
   - View related SOPs from task details
   - Suggest relevant SOPs during task creation

---

## Database Schema

### SOP Model

```javascript
{
  sopId: String (UUID),
  title: String (required),
  category: String (required),
  content: String/Markdown (required),
  version: Number (auto-increment),
  createdBy: UserId (required),
  createdAt: Date,
  lastUpdated: Date,
  lastUpdatedBy: UserId,
  tags: Array<String>,
  relatedTasks: Array<TaskId>,
  status: Enum ['Draft', 'Active', 'Archived'],
  isTemplate: Boolean,
  templateData: Object (if isTemplate = true)
}
```

### SOP Version History

```javascript
{
  versionId: String (UUID),
  sopId: String,
  version: Number,
  content: String/Markdown,
  updatedBy: UserId,
  updatedAt: Date,
  changeReason: String (optional)
}
```

### Firestore Collections

```
/sops/{sopId}
/sopVersions/{versionId}
/sopCategories/{categoryId}
```

---

## Implementation Steps

### Step 1: Backend Models & Services

#### File: `backend/models/SOP.js`

**Requirements:**
- All fields with validation
- Status enum validation
- Template data structure
- Version tracking

#### File: `backend/models/SOPVersion.js`

**Requirements:**
- Immutable version records
- Link to parent SOP
- Change tracking

#### File: `backend/services/sopService.js`

**Core Functions:**
```javascript
async createSOP(sopData, userId)
async getSOP(sopId)
async updateSOP(sopId, updates, userId, changeReason)
  // Creates new version automatically
async archiveSOP(sopId, userId)
async listSOPs(filters)
async searchSOPs(query, filters)
async getSOPVersionHistory(sopId)
async linkSOPToTask(sopId, taskId)
async unlinkSOPFromTask(sopId, taskId)
async getRelatedSOPs(taskId)
```

**Key Behaviors:**
- Every update creates a new version
- Versions are immutable
- Search indexes title, content, tags
- Category validation

#### File: `backend/services/templateService.js`

**Core Functions:**
```javascript
async createTaskFromTemplate(sopId, customizations, userId)
async getTemplates(category)
async saveAsTemplate(taskId, templateName, userId)
```

---

### Step 2: API Routes

#### File: `backend/routes/sopRoutes.js`

**Endpoints:**
```
POST   /api/sops                    - Create SOP
GET    /api/sops                    - List SOPs (with filters)
GET    /api/sops/search             - Search SOPs
GET    /api/sops/categories         - List categories
GET    /api/sops/:id                - Get SOP details
PUT    /api/sops/:id                - Update SOP (creates version)
DELETE /api/sops/:id                - Archive SOP
GET    /api/sops/:id/versions       - Get version history
POST   /api/sops/:id/link-task      - Link SOP to task
DELETE /api/sops/:id/unlink-task    - Unlink SOP from task
GET    /api/sops/templates          - Get all templates
POST   /api/sops/templates/:id/create-task - Create task from template
```

**Update:** `backend/server.js` to register routes

---

### Step 3: Frontend Components

#### File: `frontend/src/components/KnowledgeBase.jsx`

**Main knowledge base interface:**

**Features:**
- Browse SOPs by category
- Search bar with real-time results
- Filter by status (Active/Draft/Archived)
- Filter by tags
- Create new SOP button
- Template toggle view

**Layout:**
```
┌─────────────────────────────────────┐
│  Knowledge Base                     │
│  [Search...] [+ New SOP]           │
├─────────────┬───────────────────────┤
│ Categories  │  SOP List             │
│ □ All       │  ┌─────────────────┐  │
│ □ Onboard   │  │ SOP Title       │  │
│ □ Process   │  │ Category • Tags │  │
│ □ Technical │  │ Updated: Date   │  │
│ □ Templates │  └─────────────────┘  │
└─────────────┴───────────────────────┘
```

#### File: `frontend/src/components/SOPEditor.jsx`

**Create/Edit SOP interface:**

**Features:**
- Title input
- Category selector (with create new)
- Markdown editor with preview
- Tags input (multi-select)
- Template toggle
- Template configuration (if template)
- Save as Draft / Publish
- Version history viewer

**Template Configuration:**
```javascript
{
  defaultObjective: String,
  defaultAssignee: String,
  defaultDuration: Number (days),
  customFields: Array<{name, type, defaultValue}>
}
```

#### File: `frontend/src/components/SOPViewer.jsx`

**View SOP details:**

**Features:**
- Rendered markdown content
- Metadata display (category, tags, author, date)
- Version history dropdown
- Edit button (if permissions)
- Link to task button
- Related tasks list
- Create task from template (if template)

#### File: `frontend/src/components/SOPSearch.jsx`

**Reusable search component:**

**Features:**
- Search input with debounce
- Real-time results
- Highlight matching text
- Filter options
- Sort options (relevance, date, title)

#### File: `frontend/src/components/TemplateSelector.jsx`

**Template selection for task creation:**

**Features:**
- Browse templates by category
- Preview template content
- Customize template fields
- Create task from template

#### File: `frontend/src/components/SOPLinker.jsx`

**Link SOPs to tasks:**

**Features:**
- Search SOPs
- Select multiple SOPs
- Display linked SOPs
- Unlink functionality
- Quick view SOP content

---

### Step 4: Integration with Existing Task System

#### Modify: `frontend/src/components/TaskForm.jsx`

**Add SOP integration:**
- "Link SOPs" section
- SOPLinker component
- Display linked SOPs
- Quick create from template button

#### Modify: `frontend/src/components/TaskBoard.jsx`

**Add template quick-create:**
- "Create from Template" button
- TemplateSelector modal
- Quick task creation flow

#### Modify: `backend/services/taskService.js`

**Add SOP relationship:**
- Store linkedSOPs in task
- Update getTask to include SOP details
- Add getRelatedSOPs helper

---

### Step 5: Search Implementation

#### File: `backend/services/searchService.js`

**Full-text search:**

**Options:**
1. **Firestore native** (simple, limited)
2. **Algolia** (powerful, external service)
3. **Client-side search** (for small datasets)

**Recommended for Phase 2:** Firestore with client-side filtering

**Functions:**
```javascript
async searchSOPs(query, filters) {
  // Search in: title, content, tags
  // Filter by: category, status, tags
  // Sort by: relevance, date, title
}

async suggestSOPs(taskObjective) {
  // Suggest relevant SOPs based on task objective
  // Use keyword matching
}
```

---

## File Structure (Phase 2)

```
backend/
├── models/
│   ├── SOP.js ✓
│   └── SOPVersion.js ✓
├── services/
│   ├── sopService.js ✓
│   ├── templateService.js ✓
│   └── searchService.js ✓
├── routes/
│   └── sopRoutes.js ✓
└── tests/
    └── sop.test.js ✓

frontend/src/
├── components/
│   ├── KnowledgeBase.jsx ✓
│   ├── SOPEditor.jsx ✓
│   ├── SOPViewer.jsx ✓
│   ├── SOPSearch.jsx ✓
│   ├── TemplateSelector.jsx ✓
│   └── SOPLinker.jsx ✓
├── services/
│   └── sopApi.js ✓
└── context/
    └── KnowledgeContext.jsx ✓
```

---

## Success Criteria

### Functional Requirements

- ✅ Create, edit, archive SOPs
- ✅ Version control with history
- ✅ Search SOPs by title, content, tags
- ✅ Filter by category and status
- ✅ Link SOPs to tasks
- ✅ Create tasks from templates
- ✅ Browse templates by category

### User Experience

- ✅ Markdown editor with preview
- ✅ Intuitive category organization
- ✅ Fast search results
- ✅ Easy SOP linking from task form
- ✅ One-click task creation from template

### Data Integrity

- ✅ Immutable version history
- ✅ Proper SOP-task relationships
- ✅ Category validation
- ✅ Template data validation

---

## Testing Strategy

### Unit Tests

**File:** `backend/tests/sop.test.js`

```javascript
// Test SOP creation
// Test SOP update creates version
// Test version history retrieval
// Test SOP search
// Test template creation
// Test task creation from template
// Test SOP-task linking
```

### Manual Testing

1. **SOP Lifecycle**
   - Create SOP with markdown content
   - Edit SOP and verify new version created
   - View version history
   - Archive SOP

2. **Search & Discovery**
   - Search by keyword
   - Filter by category
   - Filter by tags
   - Verify results accuracy

3. **Templates**
   - Create task template
   - Customize template fields
   - Create task from template
   - Verify task has correct defaults

4. **Task Integration**
   - Link SOP to existing task
   - View linked SOPs from task
   - Unlink SOP from task
   - Create task with SOP link

---

## Implementation Timeline

**Week 3:**
- Day 1-2: Backend models, services, routes
- Day 3-4: Frontend KnowledgeBase, SOPEditor
- Day 5: Search implementation

**Week 4:**
- Day 1-2: Template functionality
- Day 3: Task integration (linking)
- Day 4: Testing and bug fixes
- Day 5: Polish and documentation

---

## Integration with Phase 1

Phase 2 builds on Phase 1 by:
- Using existing Task model (add linkedSOPs field)
- Using existing Objective model (for template defaults)
- Following same audit logging patterns
- Matching UI/UX patterns from TaskBoard

**No breaking changes to Phase 1 code.**

---

## Future Enhancements (Phase 3+)

- AI-suggested SOPs during task creation
- Auto-generate SOPs from recurring tasks
- SOP analytics (usage, effectiveness)
- Collaborative editing
- SOP approval workflows

---

## Key Principles (From Architecture)

1. **Institutional Memory**: Knowledge survives team changes
2. **Reusability**: Templates reduce repetitive work
3. **Searchability**: Find knowledge when needed
4. **Versioning**: Track knowledge evolution
5. **Integration**: SOPs connected to actual work (tasks)

---

**Ready to implement? Start with Step 1: Backend Models & Services!**
