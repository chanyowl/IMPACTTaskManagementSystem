# 🚀 Quick Start Prompt for Claude Code - Phase 2

Copy and paste this prompt into Claude Code to begin Phase 2 implementation:

---

## Prompt:

```
Please implement Phase 2 (Knowledge & SOP Module) of the Task Management System by following the detailed instructions in @CLAUDE_CODE_PROMPT_PHASE2.md

CRITICAL: You MUST read these source documents first (in order):
1. @ARCHITECTURE_SUMMARY.md - Review "Knowledge & SOP Module" section
2. @PHASE2_IMPLEMENTATION_PLAN.md - Step-by-step execution guide
3. @README_TASK_MANAGEMENT.md - Phase 1 completion status

Phase 2 Goals:
- Build SOP (Standard Operating Procedures) management system
- Implement version control for SOPs (immutable history)
- Create searchable knowledge base
- Enable task templates from SOPs
- Link SOPs to tasks bidirectionally

Key Requirements:
- Every SOP update MUST create a version record (immutable)
- Search across title, content, and tags
- Support markdown content with preview
- Template system for quick task creation
- Integrate with existing Phase 1 task system

Start with Step 1 in CLAUDE_CODE_PROMPT_PHASE2.md: Backend Models (SOP.js, SOPVersion.js)

Track your progress in the Phase 2 section of task.md
```

---

## Alternative Shorter Prompt:

```
Implement Phase 2 (Knowledge/SOP Module) following @CLAUDE_CODE_PROMPT_PHASE2.md

Read these first:
- @ARCHITECTURE_SUMMARY.md (Knowledge & SOP section)
- @PHASE2_IMPLEMENTATION_PLAN.md (execution guide)

Build: SOP models → Services with versioning → API routes → React components

Key: Version control, search, templates, task integration
```

---

## What Will Be Built:

**Backend:**
✅ SOP and SOPVersion models  
✅ SOP service with versioning  
✅ Template service  
✅ Search service  
✅ API routes for SOPs  

**Frontend:**
✅ KnowledgeBase main interface  
✅ SOPEditor with markdown support  
✅ SOPViewer with version history  
✅ SOPSearch component  
✅ TemplateSelector for quick task creation  
✅ SOPLinker for task integration  

**Integration:**
✅ Link SOPs to tasks  
✅ Create tasks from templates  
✅ View related SOPs from tasks  

---

## Files Claude Code Will Reference:

✅ **CLAUDE_CODE_PROMPT_PHASE2.md** - Complete Phase 2 implementation guide  
✅ **PHASE2_IMPLEMENTATION_PLAN.md** - Phase 2 execution steps  
✅ **ARCHITECTURE_SUMMARY.md** - Architecture requirements  
✅ **README_TASK_MANAGEMENT.md** - Phase 1 status  

All files are in your project directory and ready to use! 🎯
