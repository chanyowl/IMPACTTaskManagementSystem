You are generating a DOST IMPACT-NXT Quarterly Narrative Report.

⚠️ CRITICAL INSTRUCTION: FOLLOW "MECHANISM v3 (BULLETPROOF)" EXACTLY.
This is a compliance document. Creativity is FORBIDDEN for structure. You must fill the strict templates below.

=== ABSOLUTE RULES (VIOLATION = FAILURE) ===
1. EXACTLY 3 CHAPTERS. The report ends at Chapter 3. NEVER create Chapter 4, 5, "Conclusion", or "Recommendations".
2. Chapter 2 absorbs ALL detailed content. Accomlishments go into §2.X subsections.
3. Chapter 1 is ONLY for the overview table and financial reference.
4. Executive Summary is NOT a chapter. It stands alone before Chapter 1.
5. NO "I" or "We". Use passive institutional voice ("The project team completed...").
6. Follow the EXACT paragraph templates defined below.

Quarter: {{quarterName}} Quarter
Period: {{dateRange}}
Submission Month: {{submissionMonth}} (Inferred)

=== PHASE 0: DATA EXTRACTION (AUTOMATED FORENSICS) ===
STEP 1: Extract tasks from the provided DASHBOARD DATA below.
STEP 2: Reconstruct the "Story Arc" from the 'UpdatesAndActivityLog'. Look for pivots, challenges, and decisions.

=== GENERATION TEMPLATES (YOU MUST FOLLOW THESE) ===

PHASE 3: EXECUTIVE SUMMARY (Exactly 5 paragraphs)
- Para 1: "The [quarter] quarter of the IMPACT-NXT Project ([dates]) focused on [themes]..."
- Para 2: "The project team completed [outputs]..."
- Para 3: "A major highlight was [highlight]..."
- Para 4: "Other notable accomplishments include..."
- Para 5: "Overall, the project is [hedged confidence]..."

PHASE 4: CHAPTER 1 (Introduction)
- Heading: "Chapter 1: Introduction and Overview of Accomplishments"
- Para 1: (Use the FIXED Project Identity Block: "The IMPACT-NXT Project is a major national initiative...")
- Para 2: "This [quarter] quarter [thematic focus]."
- Section 1.1: "The accomplishments during this quarter directly support the following project objectives:"
- Table 1: Columns [OBJECTIVES | TARGET ACTIVITIES | ACCOMPLISHMENTS]
  - OBJECTIVES: Use the Objective Title.
  - TARGET ACTIVITIES: Use the EXACT text from the Objective Description provided below.
  - ACCOMPLISHMENTS: List specific tasks done as **BULLET POINTS** (• Task 1...). Do NOT use narrative paragraphs here.
- Section 1.2: "[Refer to attached Form 8]" (One line only).

PHASE 5: CHAPTER 2 (Detailed Activities)
- Heading: "Chapter 2: Detailed [Quarter] Quarter Activities and Accomplishments"
- Structure: Group tasks into Work Streams (§2.1, §2.2...).
- Subsection Micro-Structure (Crucial):
  1. Context Opener: "Following the completion of..."
  2. Activity Description: "The team developed..." (Cite 'Description' and 'Updates')
  3. Evidence/Metrics: "A total of [X]..." (Cite 'Evidence' links)
  4. Specific Accomplishments (Crucial):
     - Iterate through the 'UpdatesAndActivityLog' for this task.
     - **MANDATORY**: For EACH significant update/subtask found in the log, create a **bold bullet point**.
     - **STRICT FORMAT**:
       * **[Subtask Name from Log]:** [2-3 sentence explanation of what was done and its impact].
     - **FORBIDDEN**: Do NOT summarize these updates into a single paragraph. You must list them individually.
     - **FORBIDDEN**: Do NOT use level 4 headers (e.g., 2.1.1.1). Use bullet points only.
- Handling Challenges: Frame as "There were several major challenges..." within the relevant subsection.

PHASE 6: CHAPTER 3 (Assessment & Next Steps)
- Heading: "Chapter 3: [Quarter] Quarter Assessment and Next Steps"
- Section 3.1: "(Refer to attached Form 6)"
- Section 3.2:
  - Target Period line.
  - Framing: "The [Next] Quarter marks a critical shift..."
  - List: "3.2.1 Priority Activities" (Bulleted list of next steps based on 'Pending' tasks).

=== INPUT DATA ===

*** USER SUPPLEMENTARY INPUTS (PHASE 0.3) ***
- Quarter: {{quarterName}}
- Date Range: {{dateRange}}
- Submission Month: {{submissionMonth}}
- Challenges: {{challenges}}
- Plans for Next Quarter: {{nextQuarterPlans}}
- Offline Accomplishments: {{actualAccomplishments}}
- Survey/Data Metrics: {{surveyMetrics}}

*** DASHBOARD DATA EXTRACTED ***
{{dashboardData}}

*** EVIDENCE CONTENT(CRAWLED FROM URLs) ***
{{crawledContent}}

*** INSTRUCTIONS FOR EVIDENCE USAGE ***
- Create sub-sub-sections (e.g., 2.1.1, 2.1.2) to summarize specific findings.
- **FORMATTING RULE**: Do NOT use level 4 headers (e.g., 2.1.1.1). Instead, use bullet points for specific details within these sections. Each bullet should be 2-3 sentences explaining the finding.
- Quote key phrases or metrics from the evidence content to add depth.

*** SYSTEM CONTEXT ***
  - OFFICIAL PROJECT OBJECTIVES(Use these EXACTLY for Table 1):
{{projectObjectives}}

INSTRUCTION FOR TABLE 1:
1. Column 1(OBJECTIVES): Copy the 'title' from the OFFICIAL PROJECT OBJECTIVES above.
2. Column 2(TARGET ACTIVITIES): Copy the 'targetActivities' list from the OFFICIAL PROJECT OBJECTIVES above. Format as a bulleted list using HTML '<br>• ' for line breaks.
3. Column 3(ACCOMPLISHMENTS):
- Scan the "DASHBOARD DATA" tasks.
   - For Objective 1("Customizing..."), list tasks where TaskName / Deliverable contains "Target 1.x".
   - For Objective 2("Implementing..."), list tasks where TaskName / Deliverable contains "Target 2.x".
   - For Objective 3("Establishment..."), list tasks where TaskName / Deliverable contains "Target 3.x".
   - For Objective 4("Recommendations..."), list tasks where TaskName / Deliverable contains "Target 4.x".
   - ** CRITICAL FORMATTING RULE **: Use HTML break tags ('<br>• ') to separate bullet points. ** NEVER ** use raw newlines inside the table cells. The entire table row must be on a SINGLE line of text.
   
   ** STRICT TABLE SYNTAX:**
  Ensure the table follows standard Markdown syntax exactly. 
   - You MUST ensure there is a newline character after the header row.
   - You MUST ensure there is a newline character after the separator row.
   - You MUST ensure there is a newline character after each data row.
   - Do NOT combine the header and separator on the same line.

Generate the complete report in Markdown.
