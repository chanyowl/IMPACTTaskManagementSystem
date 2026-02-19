# 🚀 Quick Start Prompt for Claude Code

Copy and paste this prompt into Claude Code to begin implementation:

---

## Prompt:

```
Please implement Phase 1 of the Task Management System by following the detailed instructions in @CLAUDE_CODE_PROMPT.md

CRITICAL: You MUST read these source documents first (in order):
1. @ARCHITECTURE_SUMMARY.md - Essential architecture requirements from 122-page PDF
2. @PHASE1_IMPLEMENTATION_PLAN.md - Step-by-step execution guide
3. @TASK_MANAGEMENT_IMPLEMENTATION_PLAN.md - Full system context
4. @TASK_CHECKLIST.md - Progress tracking

Key Requirements:
- Implement ALL mandatory fields: taskId, objective, assignee, startDate, dueDate, status, deliverable, evidence
- Every task mutation MUST create an audit log (immutable)
- Ontology validation MUST prevent invalid data
- Build Kanban board: Pending | Active | Done
- Follow existing Firebase Auth and project patterns

Start with Step 1 in CLAUDE_CODE_PROMPT.md: Database Models & Core Ontology

Track your progress in TASK_CHECKLIST.md as you complete each component.
```

---

## Alternative Shorter Prompt:

```
Implement Phase 1 of the Task Management System following @CLAUDE_CODE_PROMPT.md

Read these first:
- @ARCHITECTURE_SUMMARY.md (architecture rules)
- @PHASE1_IMPLEMENTATION_PLAN.md (execution guide)

Build: Database models → Backend services → API routes → React components

Key: Mandatory fields, ontology validation, audit logging, Kanban UI
```

---

## Files Claude Code Will Reference:

✅ **CLAUDE_CODE_PROMPT.md** - Your complete implementation guide  
✅ **ARCHITECTURE_SUMMARY.md** - Architecture requirements (from 122-page PDF)  
✅ **PHASE1_IMPLEMENTATION_PLAN.md** - Phase 1 execution steps  
✅ **TASK_MANAGEMENT_IMPLEMENTATION_PLAN.md** - Full system context  
✅ **TASK_CHECKLIST.md** - Progress tracking  

All files are in your project directory and ready to use! 🎯
