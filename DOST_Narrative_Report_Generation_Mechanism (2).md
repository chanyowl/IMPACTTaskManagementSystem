# DOST IMPACT-NXT Quarterly Narrative Report — Generation Mechanism

## Purpose of This Document
This document is a **step-by-step, forensic-level blueprint** for an AI agent to generate an ultra-quality DOST quarterly narrative report. It is reverse-engineered from the approved Q1 report and captures every structural, linguistic, rhetorical, and formatting pattern so the output is indistinguishable from the original team's work.

## ⚠️ GLOBAL CONSTRAINTS — READ BEFORE GENERATING

These rules are ABSOLUTE and override any AI instinct to expand or restructure:

1. **EXACTLY 3 CHAPTERS.** The report has Chapter 1, Chapter 2, and Chapter 3. NEVER create Chapter 4, Chapter 5, or beyond. This is a DOST-mandated structure based on the approved Q1 report.
2. **Chapter 2 absorbs ALL detailed content.** If you have many accomplishments, create more subsections (§2.1, §2.2, §2.3... §2.10 if needed) — do NOT create new chapters.
3. **Chapter 3 is ONLY for assessment and next steps.** It is short by design (1–2 pages max).
4. **Chapter 1 is ONLY for the overview table and financial reference.** It is a summary, not a detailed narrative.
5. **The Executive Summary is NOT a chapter.** It stands alone before Chapter 1.
6. **Do not invent sections** that don't exist in the skeleton (e.g., "Conclusions", "Methodology", "Recommendations" as standalone chapters).

---

## PHASE 0: PRE-GENERATION — DATA EXTRACTION & INPUT REQUIREMENTS

The AI agent's PRIMARY data source is the **Task Management Dashboard**. Before generating any content, the agent must systematically extract and organize data from the dashboard, then supplement with manual user inputs where needed.

---

### 0.1 Dashboard Data Extraction (Primary Source)

The task management dashboard is the single source of truth for what the team actually accomplished. The AI agent MUST extract the following data fields from each task:

#### 0.1.1 Fields to Extract Per Task

| Field | What to Extract | How It Maps to the Report |
|-------|----------------|--------------------------|
| **Task Name / Title** | The main task identifier | Becomes the activity name in Table 1 (§1.1) and the section/subsection title in Chapter 2 |
| **Task Description** | Detailed description of what the task involves | Provides the "Activity Description" paragraph content in Chapter 2's 4-part micro-structure |
| **Status** | Current status (e.g., Completed, In Progress, Not Started, Deferred, Blocked) | Determines placement: Completed → accomplishments; In Progress → partial accomplishments + next quarter plans; Deferred → §3.2 with explanation |
| **Subtasks / Checklist Items** | Granular steps within the main task, each with their own status | Becomes the detailed bullet points in the Table 1 ACCOMPLISHMENTS column and the granular narrative in Chapter 2 subsections |
| **Updates / Comments / Activity Log** | Progress notes added by the user as the task evolves over time | **CRITICAL**: These are the richest source of narrative content. They reveal the journey, decisions made, pivots, challenges encountered, and rationale. Use these to write the context and significance portions of Chapter 2 |
| **URL / Evidence Field** | Links to actual outputs — documents, survey forms, dashboards, publications, presentations, spreadsheets, external tools | **CRITICAL**: These serve two purposes: (1) The AI should VISIT/READ these URLs to understand the actual substance and quality of the deliverable, enabling richer narrative writing; (2) These become Annex references or in-text citations (e.g., "See Annex B" or "See here") |
| **Assigned To** | Team member responsible | Helps attribute work correctly (though the report uses institutional voice, not individual attribution) |
| **Due Date / Completion Date** | When the task was due vs. when it was completed | Reveals timeline adherence, delays, and early completions — feeds into the Chapter 3 assessment and challenge narratives |
| **Priority / Weight** | Priority level or percentage weight if assigned | Maps to DOST percentage weights in Table 1 TARGET ACTIVITIES column |
| **Tags / Categories / Labels** | Organizational tags (e.g., "Framework Development", "Survey", "Stakeholder Engagement") | Used to GROUP tasks into the Chapter 2 work stream sections (§2.1, §2.2, §2.3, etc.) |
| **Attachments** | Any files attached to the task | Potential Annex materials |

#### 0.1.2 Extraction Processing Rules

Once raw data is extracted, the AI agent must process it through these steps:

**Step 1 — Filter by Quarter Date Range**
Only include tasks that had activity within the reporting quarter's date range. A task qualifies if:
- It was completed during the quarter, OR
- It was in progress during the quarter (include as partial accomplishment), OR
- It was explicitly started during the quarter, OR
- It received meaningful updates/subtask completions during the quarter

**Step 2 — Classify Each Task by Status**
Assign each task to one of these report buckets:

| Status | Report Bucket | Where It Appears |
|--------|--------------|------------------|
| **Completed** | Full accomplishment | Table 1 accomplishments column + dedicated Chapter 2 subsection |
| **In Progress (significant)** | Partial accomplishment | Table 1 with qualifier ("Ongoing — X% complete") + Chapter 2 subsection with progress narrative |
| **In Progress (just started)** | Minor mention | Brief mention in Table 1 or Chapter 2 + fuller treatment planned for §3.2 |
| **Deferred / Blocked** | Deferred item | Mentioned in Table 1 with reason + addressed in §3.2 as upcoming |
| **Not Started** | Next quarter plan | Omit from Chapter 2; include in §3.2 only |

**Step 3 — Group Tasks into Work Streams**
Using the task tags/categories, group related tasks into logical work streams that will become Chapter 2 sections. Grouping logic:
- Tasks sharing the same tag/category → same §2.X section
- Tasks with parent-child relationships (main task + subtasks) → §2.X with §2.X.Y subsections
- Standalone high-impact tasks (events, conferences, major deliverables) → their own §2.X section

**Step 4 — Evidence Deep-Dive**
For each task that has URLs/evidence:
- Access and review the linked resource (document, dashboard, form, publication)
- Extract key details: scope, scale, quality indicators, specific metrics
- Use this to write informed, substantive narrative — NOT just surface-level task descriptions
- Note any metrics or data points that can be quoted in the report (e.g., "83 completed survey responses", "30 out of 34 institutions")

**Step 5 — Reconstruct the Story Arc**
Using the updates/comments/activity log:
- Identify the chronological progression of each major work stream
- Note any pivots, decisions, or methodology changes (these become rich narrative content)
- Identify challenges mentioned in updates and how they were resolved
- Map how subtask completion built toward the main task's deliverable

#### 0.1.3 Dashboard Data-to-Report Mapping Summary

```
DASHBOARD                          →    REPORT LOCATION
─────────────────────────────────────────────────────────
Task Names (Completed)             →    Table 1 Accomplishments + Ch.2 section titles
Task Names (In Progress)           →    Table 1 (qualified) + Ch.2 + §3.2
Task Names (Deferred)              →    Table 1 (with reason) + §3.2
Task Descriptions                  →    Ch.2 Activity Description paragraphs
Subtask Statuses                   →    Ch.2 granular detail + completion metrics
Updates / Activity Log             →    Ch.2 Context Openers + Significance Closers + Challenge narratives
URL / Evidence Links               →    Ch.2 substantive detail + Annex references
Completion Dates vs Due Dates      →    Ch.3 assessment + timeline variance notes
Tags / Categories                  →    Ch.2 section grouping logic
Priority / Weights                 →    Table 1 percentage weights
```

---

### 0.2 Manual User Inputs (Supplementary)

After dashboard extraction, the AI agent should ask the user for the following supplementary inputs that may NOT exist in the dashboard:

#### 0.2.1 Required from User
| # | Input | Why It's Needed |
|---|-------|-----------------|
| 1 | **Quarter number and exact date range** (e.g., "Second Quarter, November 16, 2025 – February 15, 2026") | Title page, headers, and all temporal references |
| 2 | **Month of submission** (e.g., "February 2026") | Title page footer |
| 3 | **Any accomplishments NOT tracked in the dashboard** | Some work may happen outside the tool — meetings, informal agreements, strategic decisions |
| 4 | **Any new challenges or deviations from the work plan** not captured in task updates | High-level strategic challenges the user may not have logged |
| 5 | **Planned activities for the NEXT quarter** (if not already in the dashboard as future tasks) | Section 3.2 |

#### 0.2.2 Optional but High-Value Inputs
| # | Input | Impact on Quality |
|---|-------|-------------------|
| 6 | Names of key events, workshops, conferences held | Dedicated subsections like §2.4 in Q1 |
| 7 | New partnerships, MOUs, or institutional agreements | Adds strategic credibility |
| 8 | Quotes or statements from key stakeholders | Rhetorical anchoring (see §2.4 pattern) |
| 9 | Status of Form 6 and Form 8 | Cross-references in §1.2 and §3.1 |
| 10 | Any annexes to include (tools, dashboards, publications) | Annex section completeness |
| 11 | Infographics or figures to reference | Figure captions and placement |
| 12 | Any context or nuance the AI should know that isn't in the dashboard | Prevents misinterpretation of task data |

---

### 0.3 Data Sufficiency Check

Before proceeding to Phase 1, the AI agent must verify it has enough data to write a quality report:

| Check | Minimum Threshold | If Not Met |
|-------|------------------|------------|
| Number of completed/in-progress tasks extracted | At least 3–5 substantial tasks | Ask user: "The dashboard shows limited activity this quarter. Are there tasks tracked elsewhere?" |
| Evidence/URL coverage | At least 50% of major tasks should have evidence links | Flag to user: "Some tasks lack evidence links. Can you provide URLs or descriptions of deliverables?" |
| Update/comment richness | Major tasks should have at least 2–3 updates each | Ask user: "Task [X] has limited updates. Can you describe the journey/challenges for this work?" |
| Next quarter plans | At least 3 planned activities identified | Ask user: "What are the priority activities for next quarter?" |

**If the AI agent has rich dashboard data with good evidence links and detailed updates, it should be able to generate ~80% of the report autonomously, only asking the user to verify and supplement.**

---

## PHASE 1: DOCUMENT ARCHITECTURE

### 1.1 Exact Section Skeleton

The report MUST follow this exact hierarchy. Do not add, remove, or reorder sections.

**⚠️ HARD CONSTRAINT: The report has EXACTLY 3 chapters. NEVER create Chapter 4, Chapter 5, or any additional chapters. ALL accomplishments go inside Chapter 2 as subsections (§2.1, §2.2, §2.3, etc.). ALL forward-looking content goes inside Chapter 3. If you have more content, add MORE SUBSECTIONS within the existing 3 chapters — do NOT add more chapters. This is a DOST-mandated structure.**

```
COVER PAGE
TABLE OF CONTENTS
EXECUTIVE SUMMARY
CHAPTER 1: Introduction and Overview of Accomplishments
  1.1 Project Objectives [contains the Master Accomplishments Table]
  1.2 Financial Status [single-line cross-reference to Form 8]
CHAPTER 2: Detailed [Nth] Quarter Activities and Accomplishments
  2.X [Major Work Stream A]
    2.X.1 [Sub-activity 1]
    2.X.2 [Sub-activity 2]
  2.Y [Major Work Stream B]
    2.Y.1 ...
  2.Z [Major Work Stream C — if applicable]
  [Continue as needed based on actual accomplishments]
CHAPTER 3: [Nth] Quarter Assessment and Next Steps
  3.1 Form-based Assessment of Activities and Accomplishments
  3.2 Upcoming Activities and Recommendations for the [Next] Quarter
    3.2.1 Priority Activities
ANNEX SECTION
  Annex A: [title]
  Annex B: [title]
  ...
```

### 1.2 Cover Page Specification

The cover page contains EXACTLY these elements in this order, vertically centered:

1. **Institutional logos** — Three logos side-by-side: Ateneo de Manila University (left), DOST-PCIEERD (center), Caraga State University (right). *Note: These logos are fixed assets carried from quarter to quarter.*
2. **Project title** — Full title in large, bold, centered text:
   > "Competency Development and Training Needs Analysis for Technology Transfer Officers of the IMPACT Network"
3. **Quarter label** — e.g., "Second Quarter Report"
4. **Period statement** — e.g., "(for the period November 16, 2025 to February 15, 2026)"
5. **Submission month** — e.g., "February 2026"

### 1.3 Table of Contents

- Auto-generated from headings
- Includes page numbers
- Depth: 3 levels (Chapter → Section → Subsection)
- Includes Annex titles

---

## PHASE 2: WRITING THE EXECUTIVE SUMMARY

### 2.1 Structure Pattern (Reverse-Engineered)

The Executive Summary follows a **5-beat narrative arc**:

| Beat | Function | Example from Q1 |
|------|----------|-----------------|
| **Beat 1: Temporal Frame + Theme Statement** | One sentence establishing the quarter and its overarching theme | "The first quarter...focused on foundational research, early data gathering, stakeholder alignment, and the successful implementation of the first-ever IMPACT Local Conference..." |
| **Beat 2: Core Technical Accomplishments** | 1–2 sentences listing the primary technical outputs, using specific counts | "The project team completed extensive desk research, conducted four (4) different versions of pilot surveys...and finalized the methodology..." |
| **Beat 3: Marquee Highlight** | A short paragraph highlighting the single most impressive accomplishment of the quarter, with contextual drama if applicable | "A major highlight of the quarter was the organization and conduct of the first IMPACT Local Conference, despite significant challenges brought by Typhoon Tino." |
| **Beat 4: Additional Notable Accomplishments** | A brief paragraph listing 2–3 other noteworthy items that don't fit neatly into the core narrative | "Other notable accomplishments include the study of the WIPO TNA Toolkit, securing AToP's willingness to assist..." |
| **Beat 5: Overall Status Verdict** | A single closing sentence providing a confident but measured status assessment | "Overall, the project is generally on track, with key preparatory activities completed and critical partnerships secured." |

### 2.2 Linguistic Rules for the Executive Summary

- **Voice**: Passive and institutional ("The project team completed..." NOT "We completed...")
- **Tense**: Past tense for accomplishments, present tense for status
- **Quantification**: Always include specific numbers in parenthetical format: "four (4) different versions"
- **Hedging language**: Use measured confidence — "generally on track" not "completely on track"
- **Length**: 150–250 words. Never exceed 300.
- **No bullet points** in the Executive Summary — prose only

---

## PHASE 3: WRITING CHAPTER 1

### 3.1 Introductory Paragraph Pattern

Chapter 1 opens with a **project identity paragraph** — a 1-paragraph summary of what the IMPACT-NXT project IS and what it aims to deliver. This is a **fixed block** that is nearly identical across quarters.

**Template (adapt minimally each quarter):**

> The IMPACT-NXT Project is a major national initiative focused on strengthening technology transfer capacity in Philippine Higher Education Institutions (HEIs) and Research and Development Institutes (RDIs). The project responds to persistent gaps in TTO structure, capability, and professionalization, and aims to deliver:
> - A contextualized Competency Framework for TTO personnel
> - A Training Needs Analysis (TNA) tool tailored to local conditions
> - A full competency assessment of 34 universities and RDIs
> - Three competency development plans and training roadmaps (Basic, Responsive, Progressive TTOs)
> - A Policy Proposal for sustaining skills development and professionalizing TTO roles

**Rule**: This bullet list is one of the ONLY acceptable places for bullets in the entire document. It is a fixed project deliverable list and should not change between quarters.

Then close with a single bridging sentence: "This [Nth] quarter [brief thematic description of the quarter's focus]."

### 3.2 Section 1.1 — The Master Accomplishments Table (Table 1)

This is the **most structurally important element** of the entire report. It is a table titled "Table 1. Summary of Accomplishments this Quarter" with EXACTLY these columns:

| Column | Content Rules |
|--------|---------------|
| **OBJECTIVES** | Use the exact same objective names from Q1. These are FIXED project objectives and do not change. The two primary objectives are: (1) "Customize the Competency Framework for Philippine TTOs" and (2) "Implementing a Competency Assessment (which includes Training Needs Analysis)..." |
| **TARGET ACTIVITIES** | List the activities that were PLANNED for this quarter according to the work plan. Use bullet points within the cell. Include percentage weights in parentheses where applicable — e.g., "(5%)" |
| **[Nth] QUARTER ACCOMPLISHMENTS** | List actual accomplishments as bullet points. Each bullet should be a concise but specific statement of what was done. Use action verbs: "Completed...", "Conducted...", "Secured...", "Drafted...", "Organized..." |

**Critical patterns observed:**
- If an activity was deferred, state it explicitly: "Selection of candidates was pushed to a later quarter (after [prerequisite condition])..."
- Include an "Other/Extra Accomplishments" row at the bottom if applicable
- Accomplishments should map directly to (but not perfectly mirror) the target activities

### 3.3 Section 1.2 — Financial Status

This is ALWAYS a single-line cross-reference:

> [Refer to attached Form 8]

Do NOT elaborate. The financial details live in the separate DOST form.

---

## PHASE 4: WRITING CHAPTER 2 — DETAILED ACTIVITIES

This is the **longest and most substantive chapter**. It requires the most careful construction.

**⚠️ REMINDER: Chapter 2 is the ONLY place for detailed accomplishments. No matter how many activities were completed, they ALL go here as §2.X subsections. Do NOT create a Chapter 4 or Chapter 5 to accommodate overflow. Instead, add more §2.X sections (§2.1, §2.2, §2.3, §2.4, §2.5, §2.6... as many as needed).**

### 4.1 Sectioning Logic

Each **major work stream** gets its own §2.X section. Within each work stream, individual activities become §2.X.Y subsections. The Q1 report used:

```
2.1 Methodology Development
  2.1.1 Main Methodologies Examined
  2.1.2 Methodology for the Draft PH TT Core Competency Development
2.2 Foundational Work based on the Finalized Methodology
  2.2.1 Top-Down Anchoring
  2.2.2 Completion of Desk Research
  2.2.3 Situationer Survey Instrument Development and Piloting
  2.2.4 Situationer Survey Instrument Deployment
2.3 Formulation of Assessor Selection Criteria
2.4 First IMPACT Local Conference
```

**Sectioning Rules:**
- Group activities by logical work stream, NOT by chronological order
- Major sections (§2.X) represent distinct project components
- Subsections (§2.X.Y) represent specific deliverables or milestones within a component
- Standalone accomplishments (like the conference) get their own §2.X without subsections
- Title each section with a **descriptive noun phrase**, not an action verb (e.g., "Methodology Development" not "Developing the Methodology")

### 4.2 Paragraph-Level Writing Patterns

Each subsection in Chapter 2 follows a remarkably consistent **4-part micro-structure**:

| Part | Function | Typical Length | Example Signal Phrases |
|------|----------|---------------|----------------------|
| **Context Opener** | Establishes WHY this activity was needed and how it connects to the project methodology or previous work | 1–2 sentences | "Following the completion of...", "Building on the established methodological direction...", "Parallel to the instrument development..." |
| **Activity Description** | Describes WHAT was specifically done, with technical detail | 2–5 sentences | "The team undertook...", "In total, [N] versions were developed...", "Specifically, the team aligned the framework with..." |
| **Evidence/Metrics** (if applicable) | Provides quantitative or qualitative evidence of quality/completion | 1–3 sentences or a table | "A total of 30 out of 34 target institutions (88%) submitted responses...", "Pilot results indicated strong comprehension..." |
| **Significance Closer** | States the implication or downstream value of this work | 1–2 sentences | "This [work] provided a common evidence base for...", "Overall, the deployment results demonstrate strong institutional engagement..." |

### 4.3 Table Usage Patterns

Tables are used in Chapter 2 for two purposes:

**Type A — Methodological Comparison Tables**: Multi-column tables comparing frameworks, steps, or approaches. Each row represents a step/stage. Columns typically include: Step/Stage | Activities/Purpose | Validation/Methods | Quality Standards/Deliverables. These tables are always preceded by a title in the format: "Table N. [Descriptive Title]" and followed by the source citation.

**Type B — Metrics/Status Tables**: Compact tables showing target vs. actual achievement. Columns: Metric | Target | Actual | % Achievement. Always preceded by explanatory prose.

**Table Numbering**: Sequential across the entire document (Table 1, Table 2, ..., Table N). Numbering does NOT reset per chapter.

### 4.4 Figure Usage Patterns

Figures are used for:
- Process diagrams / methodology visualizations
- Infographics summarizing evolution or progress
- Data visualizations (timelines, response accumulation charts)

**Figure Formatting**:
- Placed AFTER the relevant prose paragraph
- Captioned below in italics: *"Figure N. [Descriptive Title]"*
- Sequential numbering across the document
- Referenced in prose before appearing: "The table below summarizes..." or "The figure illustrates..."

### 4.5 Linguistic Patterns for Chapter 2

**Voice and Register:**
- Predominantly **passive voice, institutional register**: "The desk research mainly covered...", "Coverage across institution types was likewise robust..."
- Occasional **active voice for emphasis on agency**: "The project team developed and iteratively refined..."
- NEVER first-person singular ("I"). First-person plural ("we") appears VERY sparingly (only 2 instances in the entire Q1 report — "we were able to secure" and "We have also published"). Default to "the project team" or "the team."

**Transition Patterns Between Subsections:**
- §2.X.1 → §2.X.2: "Following the [previous activity], the project team proceeded with..."
- §2.X.2 → §2.X.3: "Building on [previous output], the team..."
- New §2.Y: "Parallel to [previous work stream], the project team..."

**Key Vocabulary and Phrasing (use these exact patterns):**
- "bottom-up extraction of competencies"
- "top-down contextual anchoring"
- "iteratively refined"
- "deployment focused on achieving broad institutional coverage"
- "adequate data saturation"
- "institutional engagement and readiness"
- "contextual relevance, practical validity, and implementation readiness"
- "responsive to the specific realities of the Philippine technology transfer (TT) ecosystem"
- "grounded in real practice, responsive to institutional diversity, and defensible to both academic and policy audiences"

**Acronym Protocol:**
- First use: Spell out in full with acronym in parentheses — "Higher Education Institutions (HEIs)"
- Subsequent uses: Acronym only — "HEIs"
- Standard acronyms assumed known after first use: TTO, TT, TNA, HEI, RDI, SUC, KII, FGD, DOST, PCIEERD, WIPO, AToP, RTTP, ATTP, CVI, CSC, IPOPHL, CHED, NEDA

### 4.6 Handling Challenges and Deviations

When reporting challenges, follow this exact rhetorical pattern:
1. State the challenge factually: "There were several major challenges encountered by the team related to [activity]."
2. List each challenge with its impact: "The first was [issue], which [consequence]. Another was [issue]..."
3. Provide resolution or mitigation: "Rebooking fees and emergency accommodation added a significant amount to unplanned costs."
4. Close with a positive verdict: "Overall, however, the [activity] was deemed to be a success."

**Critical Rule:** NEVER frame challenges as failures. Always frame as obstacles overcome or managed.

### 4.7 Handling Deferred Activities

When an activity was deferred to a later quarter:
- State what was deferred: "Selection of candidates was pushed to a later quarter"
- Provide the reason in parentheses: "(after the first draft of the competency framework is available)"
- Indicate what WAS accomplished in its place: "the task of defining selection criteria and listing possible candidates for assessors"

---

## PHASE 5: WRITING CHAPTER 3

### 5.1 Section 3.1 — Form-Based Assessment

This is ALWAYS a single-line cross-reference:

> (Refer to attached Form 6)

### 5.2 Section 3.2 — Upcoming Activities

**Opening paragraph pattern:**
1. State the target period explicitly: "Target Period: [Date Range] (Months X, Y, and Z)"
2. Characterize the upcoming quarter's strategic phase: "The [Nth] Quarter marks a critical shift from [previous phase] to [upcoming phase]."
3. State readiness: "With [key enablers from current quarter], the project team is positioned to execute [upcoming objectives]."
4. Bridging sentence: "The following activities and recommendations are prioritized for Q[N+1]:"

### 5.3 Section 3.2.1 — Priority Activities

Each priority activity is a bullet point structured as:

> **● [Activity Title in Bold]:** [1–3 sentence description of what will be done, why it matters, and any dependencies or timeline notes.]

**Rules:**
- Order by priority (most urgent first)
- Include month targets where possible: "The immediate priority for Months 4 is..."
- Reference downstream dependencies: "Completing this step is critical to..."
- If recovering from a timeline variance, state it: "This activity is critical to recover the slight timeline variance incurred during..."
- Typically 3–6 priority activities per quarter

---

## PHASE 6: ANNEX SECTION

### 6.1 Annex Structure

Each annex gets:
1. A letter designation: Annex A, Annex B, etc.
2. A descriptive title: "Annex A: Finalized Survey Tool"
3. The actual content or a reference/link

**Rules:**
- Annexes should include supporting documents, tools, dashboards, or publications referenced in the body
- Each annex referenced in the body should be cited as: "(refer to Annex [X])" or "See Annex [X]"
- If annexes are external links or embedded documents, include the link or describe the attachment
- Annexes are listed in the Table of Contents

---

## PHASE 7: QUALITY CONTROL CHECKLIST

Before finalizing, the AI agent MUST verify the following:

### 7.1 Structural Integrity
- [ ] Cover page has all 5 elements in correct order
- [ ] Table of Contents matches actual headings and page numbers
- [ ] All three chapters are present with correct numbering — **EXACTLY 3 chapters, no more, no less**
- [ ] No Chapter 4 or Chapter 5 exists — all detailed content is inside Chapter 2 subsections
- [ ] Table 1 (Master Accomplishments) is complete and consistent
- [ ] All tables are sequentially numbered across the document
- [ ] All figures are sequentially numbered across the document
- [ ] Annex section references match body text citations
- [ ] Form 6 and Form 8 are cross-referenced (not elaborated)

### 7.2 Content Consistency
- [ ] Quarter dates are consistent throughout (cover page, exec summary, chapter titles, §3.2)
- [ ] Project objectives in Table 1 match EXACTLY across all quarters
- [ ] Accomplishments listed in Table 1 are each elaborated somewhere in Chapter 2
- [ ] Every Chapter 2 subsection follows the 4-part micro-structure
- [ ] Metrics/numbers cited in the Executive Summary match those in Chapter 2
- [ ] Planned activities from the PREVIOUS quarter's §3.2 are addressed (completed, ongoing, or deferred) in THIS quarter's Chapter 2

### 7.3 Language and Tone
- [ ] No first-person singular ("I") anywhere in the document
- [ ] First-person plural ("we") used extremely sparingly (max 2–3 instances)
- [ ] Default voice is institutional passive: "The team...", "The project..."
- [ ] All acronyms defined on first use
- [ ] Numbers written as: "four (4)" on first mention, then just "4" subsequently
- [ ] Hedged confidence language: "generally on track", "largely completed"
- [ ] Challenges framed as managed obstacles, never as failures
- [ ] Deferred activities include reason and what was done instead
- [ ] No emojis, no informal language, no contractions

### 7.4 Cross-Quarter Continuity
- [ ] The opening paragraph of Chapter 1 (project identity block) is consistent with previous quarters
- [ ] The project deliverables list in Chapter 1 is unchanged
- [ ] The narrative arc across quarters is coherent (Q1 = foundational → Q2 = execution → Q3 = validation → Q4 = synthesis)
- [ ] Any work deferred in Q(N-1) is addressed in Q(N)
- [ ] Cumulative progress percentages are tracked and updated

---

## PHASE 8: FORMATTING SPECIFICATIONS

### 8.1 Typography
- **Body text**: 11–12pt, standard serif or sans-serif font (the Q1 report uses a Google Docs-style default)
- **Headings**: Bold, sized by level (Chapter = largest, Section = medium, Subsection = smallest)
- **Table text**: Same as body or 1pt smaller
- **Figure captions**: Italicized, centered below figure

### 8.2 Spacing
- Single or 1.15 line spacing for body text
- Additional spacing before chapter headings
- No extra spacing between bullets within a bulleted list

### 8.3 Page Layout
- Standard margins (1 inch or 2.54 cm all around)
- Portrait orientation throughout
- Tables and figures may span full page width

### 8.4 Bullet Style
- Primary bullets: Filled circle (●)
- Secondary bullets (if needed): Dash (–) or hollow circle
- Bullets within Table 1 cells: Same filled circle style

---

## APPENDIX: DOST-SPECIFIC CONVENTIONS

### A. Percentage Weights
DOST-funded projects track accomplishment by percentage weight. When activities have assigned weights (e.g., "5%", "15%", "20%"), these must appear in the TARGET ACTIVITIES column of Table 1. Cumulative weights should be tracked across quarters.

### B. Form Cross-References
- **Form 6** = Activity-level assessment form (referenced in §3.1)
- **Form 8** = Financial status form (referenced in §1.2)
- These are separate DOST-mandated attachments, NOT generated by the AI agent

### C. Institutional Partners
The IMPACT-NXT project involves three institutional partners whose logos appear on the cover page:
1. Ateneo de Manila University (lead institution)
2. DOST-PCIEERD (funding agency)
3. Caraga State University (partner institution)

### D. Target Network
The project covers **34 institutions**: 16 SUCs + 12 HEIs + 6 RDIs. This number is fixed and should remain consistent across all quarters.

---

## QUICK-START PROMPT FOR THE AI AGENT

When ready to generate a report, feed the AI agent the following prompt template:

```
You are generating a DOST IMPACT-NXT Quarterly Narrative Report.

Quarter: [N]
Period: [Start Date] to [End Date]
Submission Month: [Month Year]

=== PHASE 0: DATA EXTRACTION ===
STEP 1 — Extract all tasks from the Task Management Dashboard for the period above.
For each task, capture: Task Name, Description, Status, Subtasks + their statuses,
Updates/Comments/Activity Log, URL/Evidence links, Due Date vs Completion Date,
Tags/Categories, and Priority/Weights.

STEP 2 — Process the extracted data:
  a) Filter: Only include tasks with activity during the quarter date range
  b) Classify: Bucket each task as Completed / In Progress / Deferred / Not Started
  c) Group: Cluster related tasks into work streams using tags (these become Ch.2 sections)
  d) Evidence Deep-Dive: Visit each URL/evidence link to understand the actual deliverable
     and extract metrics, scope, and quality details for richer narrative writing
  e) Story Arc: Use update logs to reconstruct the journey, decisions, pivots, and challenges

STEP 3 — Run the Data Sufficiency Check. If gaps exist, ask the user targeted questions.

=== GENERATION ===
Follow the DOST IMPACT-NXT Report Generation Mechanism EXACTLY (Phases 1-8).
Use all structural, linguistic, and formatting rules specified.

Dashboard Data Extracted:
[AUTO-POPULATED FROM DASHBOARD]

User-Provided Supplementary Inputs:
[ANY ADDITIONAL CONTEXT FROM USER]

Generate the complete report. Ensure cross-quarter continuity with previous reports.
Apply the Quality Control Checklist (Phase 7) before finalizing.
```

---

*This mechanism was reverse-engineered from the approved IMPACT-NXT First Quarter Report (August 16 – November 15, 2025) submitted to DOST-PCIEERD.*
