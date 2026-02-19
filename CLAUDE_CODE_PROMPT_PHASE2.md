# Claude Code Implementation Prompt - Phase 2

## 🎯 Objective

Implement **Phase 2: Knowledge & SOP Module** of the Task Management System to enable institutional memory preservation and knowledge reuse.

---

## 📚 Required Source Documents

**YOU MUST READ THESE FILES FIRST** (in this order):

1. **@ARCHITECTURE_SUMMARY.md** ⭐ **CRITICAL**
   - Review the "Knowledge & SOP Module" section
   - Understand institutional memory requirements
   - Review success metrics for knowledge preservation

2. **@PHASE2_IMPLEMENTATION_PLAN.md** 
   - Your primary execution guide for Phase 2
   - Step-by-step implementation instructions
   - Database schema for SOPs
   - Success criteria

3. **@README_TASK_MANAGEMENT.md**
   - See Phase 1 completion status
   - Understand existing architecture

---

## 🚀 Implementation Instructions

### Step 1: Backend Models

#### File: `backend/models/SOP.js`

**Requirements from PHASE2_IMPLEMENTATION_PLAN.md:**

Create SOP model with these fields:
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
  templateData: Object (optional)
}
```

**Validation:**
- Title, category, content are required
- Status must be one of: Draft, Active, Archived
- Version starts at 1, auto-increments on update
- If isTemplate = true, templateData must be present

**Template Data Structure:**
```javascript
{
  defaultObjective: String,
  defaultAssignee: String,
  defaultDuration: Number (days),
  customFields: Array<{name, type, defaultValue}>
}
```

#### File: `backend/models/SOPVersion.js`

**Requirements:**
```javascript
{
  versionId: String (UUID),
  sopId: String (required),
  version: Number (required),
  content: String/Markdown (required),
  updatedBy: UserId (required),
  updatedAt: Date (required),
  changeReason: String (optional)
}
```

**Critical:** Versions are **IMMUTABLE** - once created, never modified

---

### Step 2: Backend Services

#### File: `backend/services/sopService.js`

**Implement these functions:**

```javascript
// Create new SOP
async createSOP(sopData, userId)
  // Validate required fields
  // Set version = 1
  // Set createdBy = userId
  // Set status = 'Draft' if not specified
  // Save to Firestore /sops collection
  // Return created SOP

// Get single SOP
async getSOP(sopId)
  // Fetch from Firestore
  // Include related task details (populate)
  // Return SOP with metadata

// Update SOP (creates new version)
async updateSOP(sopId, updates, userId, changeReason)
  // Fetch current SOP
  // Increment version number
  // Create SOPVersion record with old content
  // Update SOP with new content
  // Set lastUpdatedBy = userId
  // Set lastUpdated = now
  // Save both SOP and SOPVersion
  // Return updated SOP

// Archive SOP
async archiveSOP(sopId, userId)
  // Update status to 'Archived'
  // Create version record
  // Return archived SOP

// List SOPs with filters
async listSOPs(filters)
  // filters: { category, status, tags, isTemplate }
  // Query Firestore with filters
  // Sort by lastUpdated desc
  // Return array of SOPs

// Search SOPs
async searchSOPs(query, filters)
  // Search in: title, content, tags
  // Apply filters (category, status)
  // Return matching SOPs with relevance score
  // Note: Use Firestore queries or client-side filtering

// Get version history
async getSOPVersionHistory(sopId)
  // Query /sopVersions where sopId = sopId
  // Sort by version desc
  // Return array of versions

// Link SOP to task
async linkSOPToTask(sopId, taskId)
  // Add taskId to SOP.relatedTasks array
  // Add sopId to Task.linkedSOPs array (update taskService)
  // Return success

// Unlink SOP from task
async unlinkSOPFromTask(sopId, taskId)
  // Remove taskId from SOP.relatedTasks
  // Remove sopId from Task.linkedSOPs
  // Return success

// Get related SOPs for a task
async getRelatedSOPs(taskId)
  // Query SOPs where relatedTasks contains taskId
  // Return array of SOPs
```

#### File: `backend/services/templateService.js`

**Implement these functions:**

```javascript
// Create task from template
async createTaskFromTemplate(sopId, customizations, userId)
  // Fetch SOP (must be template)
  // Extract templateData
  // Merge with customizations
  // Call taskService.createTask with merged data
  // Link SOP to created task
  // Return created task

// Get all templates
async getTemplates(category)
  // Query SOPs where isTemplate = true
  // Filter by category if provided
  // Return array of templates

// Save task as template
async saveAsTemplate(taskId, templateName, userId)
  // Fetch task
  // Create SOP with task data as template
  // Set isTemplate = true
  // Set templateData from task fields
  // Return created template SOP
```

#### File: `backend/services/searchService.js`

**Implement search functionality:**

```javascript
// Search SOPs (full-text)
async searchSOPs(query, filters)
  // Option 1: Firestore queries (limited)
  // Option 2: Client-side filtering (simple, works for small datasets)
  // Option 3: Algolia integration (advanced, requires setup)
  
  // Recommended for Phase 2: Client-side filtering
  // 1. Fetch all SOPs matching filters
  // 2. Filter by query in title, content, tags
  // 3. Score by relevance (title match > content match)
  // 4. Sort by relevance score
  // 5. Return results

// Suggest SOPs based on task objective
async suggestSOPs(taskObjective)
  // Extract keywords from taskObjective
  // Search SOPs by keywords
  // Return top 5 relevant SOPs
```

---

### Step 3: API Routes

#### File: `backend/routes/sopRoutes.js`

**Implement these endpoints:**

```javascript
const express = require('express');
const router = express.Router();
const sopService = require('../services/sopService');
const templateService = require('../services/templateService');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Create SOP
router.post('/', async (req, res) => {
  // Call sopService.createSOP
  // Return 201 with created SOP
});

// List SOPs
router.get('/', async (req, res) => {
  // Extract filters from query params
  // Call sopService.listSOPs
  // Return 200 with SOPs array
});

// Search SOPs
router.get('/search', async (req, res) => {
  // Extract query and filters from query params
  // Call sopService.searchSOPs
  // Return 200 with results
});

// Get categories (distinct)
router.get('/categories', async (req, res) => {
  // Query distinct categories from SOPs
  // Return 200 with array of categories
});

// Get templates
router.get('/templates', async (req, res) => {
  // Call templateService.getTemplates
  // Return 200 with templates
});

// Create task from template
router.post('/templates/:id/create-task', async (req, res) => {
  // Call templateService.createTaskFromTemplate
  // Return 201 with created task
});

// Get single SOP
router.get('/:id', async (req, res) => {
  // Call sopService.getSOP
  // Return 200 with SOP
});

// Update SOP
router.put('/:id', async (req, res) => {
  // Extract updates and changeReason from body
  // Call sopService.updateSOP
  // Return 200 with updated SOP
});

// Archive SOP
router.delete('/:id', async (req, res) => {
  // Call sopService.archiveSOP
  // Return 200 with success message
});

// Get version history
router.get('/:id/versions', async (req, res) => {
  // Call sopService.getSOPVersionHistory
  // Return 200 with versions array
});

// Link SOP to task
router.post('/:id/link-task', async (req, res) => {
  // Extract taskId from body
  // Call sopService.linkSOPToTask
  // Return 200 with success
});

// Unlink SOP from task
router.delete('/:id/unlink-task/:taskId', async (req, res) => {
  // Call sopService.unlinkSOPFromTask
  // Return 200 with success
});

module.exports = router;
```

**Update:** `backend/server.js` or `backend/server.ts`
```javascript
const sopRoutes = require('./routes/sopRoutes');
app.use('/api/sops', sopRoutes);
```

---

### Step 4: Frontend Components

#### File: `frontend/src/services/sopApi.js`

**API client for SOP operations:**

```javascript
import { getAuthToken } from './auth'; // Use existing auth

const API_BASE = '/api/sops';

export const sopApi = {
  // Create SOP
  async createSOP(sopData) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(sopData)
    });
    return response.json();
  },

  // Get SOPs
  async getSOPs(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE}?${params}`);
    return response.json();
  },

  // Search SOPs
  async searchSOPs(query, filters = {}) {
    const params = new URLSearchParams({ query, ...filters });
    const response = await fetch(`${API_BASE}/search?${params}`);
    return response.json();
  },

  // Get single SOP
  async getSOP(sopId) {
    const response = await fetch(`${API_BASE}/${sopId}`);
    return response.json();
  },

  // Update SOP
  async updateSOP(sopId, updates, changeReason) {
    const response = await fetch(`${API_BASE}/${sopId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ ...updates, changeReason })
    });
    return response.json();
  },

  // Archive SOP
  async archiveSOP(sopId) {
    const response = await fetch(`${API_BASE}/${sopId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
    });
    return response.json();
  },

  // Get version history
  async getVersionHistory(sopId) {
    const response = await fetch(`${API_BASE}/${sopId}/versions`);
    return response.json();
  },

  // Get templates
  async getTemplates(category) {
    const params = category ? `?category=${category}` : '';
    const response = await fetch(`${API_BASE}/templates${params}`);
    return response.json();
  },

  // Create task from template
  async createTaskFromTemplate(sopId, customizations) {
    const response = await fetch(`${API_BASE}/templates/${sopId}/create-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify(customizations)
    });
    return response.json();
  },

  // Link/unlink
  async linkToTask(sopId, taskId) {
    const response = await fetch(`${API_BASE}/${sopId}/link-task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({ taskId })
    });
    return response.json();
  },

  async unlinkFromTask(sopId, taskId) {
    const response = await fetch(`${API_BASE}/${sopId}/unlink-task/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${await getAuthToken()}` }
    });
    return response.json();
  }
};
```

#### File: `frontend/src/context/KnowledgeContext.jsx`

**State management for knowledge base:**

```jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { sopApi } from '../services/sopApi';

const KnowledgeContext = createContext();

export const KnowledgeProvider = ({ children }) => {
  const [sops, setSOPs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load SOPs
  const loadSOPs = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await sopApi.getSOPs(filters);
      setSOPs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load templates
  const loadTemplates = async () => {
    try {
      const data = await sopApi.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Create SOP
  const createSOP = async (sopData) => {
    const newSOP = await sopApi.createSOP(sopData);
    setSOPs([newSOP, ...sops]);
    return newSOP;
  };

  // Update SOP
  const updateSOP = async (sopId, updates, changeReason) => {
    const updated = await sopApi.updateSOP(sopId, updates, changeReason);
    setSOPs(sops.map(s => s.sopId === sopId ? updated : s));
    return updated;
  };

  // Search
  const searchSOPs = async (query, filters) => {
    setLoading(true);
    try {
      const results = await sopApi.searchSOPs(query, filters);
      setSOPs(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KnowledgeContext.Provider value={{
      sops,
      templates,
      categories,
      loading,
      error,
      loadSOPs,
      loadTemplates,
      createSOP,
      updateSOP,
      searchSOPs
    }}>
      {children}
    </KnowledgeContext.Provider>
  );
};

export const useKnowledge = () => useContext(KnowledgeContext);
```

#### File: `frontend/src/components/KnowledgeBase.jsx`

**Main knowledge base interface:**

```jsx
import React, { useState, useEffect } from 'react';
import { useKnowledge } from '../context/KnowledgeContext';
import SOPSearch from './SOPSearch';
import SOPViewer from './SOPViewer';

const KnowledgeBase = () => {
  const { sops, loadSOPs, loading } = useKnowledge();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSOP, setSelectedSOP] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadSOPs();
  }, []);

  const categories = ['All', 'Onboarding', 'Process', 'Technical', 'Templates'];

  const filteredSOPs = selectedCategory === 'All' 
    ? sops 
    : sops.filter(s => s.category === selectedCategory);

  return (
    <div className="knowledge-base">
      <div className="kb-header">
        <h1>Knowledge Base</h1>
        <button onClick={() => setShowEditor(true)}>+ New SOP</button>
      </div>

      <div className="kb-layout">
        {/* Sidebar - Categories */}
        <div className="kb-sidebar">
          <h3>Categories</h3>
          {categories.map(cat => (
            <div 
              key={cat}
              className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Main - SOP List */}
        <div className="kb-main">
          <SOPSearch />
          
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="sop-list">
              {filteredSOPs.map(sop => (
                <div 
                  key={sop.sopId}
                  className="sop-card"
                  onClick={() => setSelectedSOP(sop)}
                >
                  <h3>{sop.title}</h3>
                  <div className="sop-meta">
                    <span className="category">{sop.category}</span>
                    {sop.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="sop-date">
                    Updated: {new Date(sop.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SOP Viewer Modal */}
      {selectedSOP && (
        <SOPViewer 
          sop={selectedSOP} 
          onClose={() => setSelectedSOP(null)} 
        />
      )}
    </div>
  );
};

export default KnowledgeBase;
```

#### File: `frontend/src/components/SOPEditor.jsx`

**Create/Edit SOP with markdown editor:**

```jsx
import React, { useState } from 'react';
import { useKnowledge } from '../context/KnowledgeContext';

const SOPEditor = ({ sop, onClose }) => {
  const { createSOP, updateSOP } = useKnowledge();
  const [formData, setFormData] = useState({
    title: sop?.title || '',
    category: sop?.category || '',
    content: sop?.content || '',
    tags: sop?.tags || [],
    status: sop?.status || 'Draft',
    isTemplate: sop?.isTemplate || false,
    templateData: sop?.templateData || null
  });
  const [preview, setPreview] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sop) {
      await updateSOP(sop.sopId, formData, 'Manual update');
    } else {
      await createSOP(formData);
    }
    onClose();
  };

  return (
    <div className="sop-editor-modal">
      <div className="sop-editor">
        <h2>{sop ? 'Edit SOP' : 'New SOP'}</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />

          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            required
          >
            <option value="">Select Category</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Process">Process</option>
            <option value="Technical">Technical</option>
          </select>

          <div className="editor-tabs">
            <button type="button" onClick={() => setPreview(false)}>Edit</button>
            <button type="button" onClick={() => setPreview(true)}>Preview</button>
          </div>

          {preview ? (
            <div className="markdown-preview">
              {/* Render markdown - use library like react-markdown */}
              {formData.content}
            </div>
          ) : (
            <textarea
              placeholder="Content (Markdown supported)"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={15}
              required
            />
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SOPEditor;
```

**Continue with remaining components (SOPViewer, SOPSearch, TemplateSelector, SOPLinker) following similar patterns.**

---

## ✅ Success Criteria

Before considering Phase 2 complete:

- [x] SOPs can be created, edited, archived
- [x] Version history tracked and viewable
- [x] Search works (title, content, tags)
- [x] Categories and tags functional
- [x] Templates can be created
- [x] Tasks can be created from templates
- [x] SOPs can be linked to tasks
- [x] Related SOPs visible from task view

---

## 🚨 Critical Requirements

1. **Version Control**: Every SOP update MUST create a version record
2. **Immutability**: Version records are NEVER modified
3. **Search**: Must search across title, content, and tags
4. **Integration**: SOPs must link bidirectionally with tasks
5. **Templates**: Template data must be valid and usable

---

## 📁 Expected File Structure

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

**Ready to implement Phase 2? Start with Step 1: Backend Models!** 🚀
