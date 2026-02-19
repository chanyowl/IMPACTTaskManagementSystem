# Crystell: Product Implementation Plan

**Project:** Crystell  
**Platform:** Antigravity  
**Role:** AI Messenger for Work-Style Alignment  
**Status:** Planning Phase

---

## 1. Product Definition

### Core Problem
Traditional productivity tools treat humans as machines with constant output capacity. They ignore fluctuating energy levels, personality traits, and emotional states, leading to burnout and shame when "to-do" lists aren't completed.

### Solution
Crystell is an AI companion that learns *who* the user is to suggest *what* they should do. It decouples task management from rigid scheduling, instead matching tasks to the user's current psychological and energetic state.

### Target Users
- **Knowledge Workers:** Developers, designers, writers with autonomous schedules.
- **Freelancers/Solopreneurs:** Those lacking external structure but prone to self-exploitation.
- **Neurodivergent Users:** Individuals (ADHD/Autism) who struggle with rigid linear planning but thrive on momentum.

### Crystell's Role
- **Not a Boss:** Never commands or assigns.
- **Not a Secretary:** Does not just "take notes."
- **The Mirror:** A conversational partner that helps the user recognize their own patterns (e.g., "You tend to stall on email replies on Mondays.").

---

## 2. Design: The AI (Crystell)

### Conversation Principles
- **Chat is the UI:** No complex dashboards. Primary interaction is text/voice.
- **Inference > Interrogation:** Never asks "What is your personality type?" Instead, observes reaction to deadlines or ambiguity.
- **Low Pressure:** Uses phrases like "How does looking at X make you feel right now?" vs "You need to finish X."

### Personality Inference (Implicit)
Crystell defines a "User State" based on:
1.  **Response Latency:** Quick snappy replies (High Energy) vs. delayed/short replies (Low Energy/Overwhelmed).
2.  **Sentiment Analysis:** Anxiety markers ("I have so much to do") vs. Flow markers ("I just crushed that feature").
3.  **Task Preference:** Does the user pick "Design Logo" (Creative) or "Fix Bug" (Logical) first in the morning?

### Adaptation
- **Tone:** Mirrors the user's formality level but maintains a "Calm, Curious" baseline.
- **Depth:** Brief interactions during work hours; reflective, deeper insights during reviews (e.g., Friday afternoon).

---

## 3. Design: The Task System

### Suitability Inference (The Core Logic)
Crystell does not "assign" dates. It assigns **Suitability Scores** based on context.

### Task Attributes (The Meta-Data)
Users just dump tasks. Crystell parses them into hidden attributes:
- **Cognitive Load:** High (Deep Work) vs. Low (Admin/Email).
- **Emotional Weight:** Scary/Anxious (New client pitch) vs. Neutral (File taxes).
- **Context:** Solo vs. Social.

### The Recommendation Engine
Logic: `Task Fit = (User State + Time of Day) matching (Task Attributes)`

*   **Scenario A:** User is chatty, high sentiment, 9:00 AM.
    *   *Recommendation:* High Cognitive Load / "Eat the Frog" tasks.
*   **Scenario B:** User is terse, using negative words, 3:00 PM.
    *   *Recommendation:* Low Cognitive Load / Routine tasks. "Maybe just clear those 3 pending emails?"

---

## 4. Design: User Experience

### Onboarding (The "Zero-Form" Start)
1.  User installs App.
2.  Crystell: "Hi! I'm Crystell. Just dump everything that's on your mind right now—work, life, chores. messy is fine."
3.  User types a stream of consciousness.
4.  Crystell parses: "Okay, I see about 5 distinct things there. Which one feels like it's taking up the most space in your head?"
5. *Profile building begins immediately through this dialogue.*

### The Loop
1.  **Input:** User text/voice dumps tasks or anxieties.
2.  **Synthesis:** Crystell acknowledges and categorizes.
3.  **Nudge:** "You mentioned the quarterly report is worrying you. Do you have the headspace for it, or should we save it for tomorrow morning when you're fresh?"
4.  **Feedback:** User says "Not now." (Crystell logs: *User avoids heavy writing in afternoons*).

### Controls
- **"Not Today":** Soft snooze mechanism.
- **"Wrong Read":** User corrects Crystell ("I'm actually full of energy, just annoyed"). Crystell updates the model immediately.

---

## 5. Data & Logic

### Data Models
1.  **User Profile (Dynamic):**
    *   `PeakHours`: [10:00, 14:00]
    *   `StressTriggers`: ["Urgent deadlines", "Unknown phone calls"]
    *   `WorkStyle`: Focus-bursts vs. Marathon
2.  **Interaction Log:** Raw history of chats for context window.
3.  **Task Object:**
    *   `Description`: String
    *   `InferredTags`: [Creative, Admin, Social]
    *   `UserResistanceScore`: 0.0 - 1.0 (How much user avoids this)

### Confidence Scoring
- If Crystell is < 70% sure of a suggestion, it frames it as a question: "Do you feel like tackling X?"
- If > 90% sure: "You usually crush Y at this time of day."

---

## 6. Governance & Ethics

### Principles
- **Privacy First:** Personality insights are local/private. Never shared with employers/teams.
- **No Manipulation:** No "streaks" or "gamification" to force engagement.
- **Right to Reset:** "Forget my patterns" button.

### Fail-Safes
- If user exhibits signs of severe distress/burnout, Crystell stops suggesting tasks and shifts to "Rest Mode" or suggests stopping work entirely.

---

## 7. MVP Scope (Phase 1)
*Goal: A working chat bot that accepts tasks and suggests one based on simple time-of-day logic.*

1.  **Interface:** Simple chat window (Web/Mobile).
2.  **NLP:** Extract tasks from paragraphs of text.
3.  **Heuristics:** Basic categorization (Admin vs. Deep Work).
4.  **Memory:** Determine if user is "Morning Person" or "Night Owl" after 3 days of usage.
5.  **Action:** "Suggest a Task" button.

---

## 8. System Architecture

- **Frontend:** React Native (Mobile) / React (Web). Minimalist, text-forward.
- **Backend:** Node.js/Python.
- **AI Layer:** Large Language Model (e.g., Gemini/Claude) optimized for empathetic reasoning.
    - *System Prompt:* Maintains the Crystell persona and constraints.
- **Database:** PostgreSQL (Structured tasks) + Vector DB (Conversation history/Semantic search).

---

## 9. Future Roadmap

- **Phase 1 (MVP):** Text dump -> Task extraction -> Basic suggestions.
- **Phase 2 (The Learner):** Pattern recognition ("You always delay writing tasks"). Integration with Calendar (Passive context).
- **Phase 3 (Holistic):** Integration with wearable health data (HRV/Sleep) to objectively measure energy for even better precision.
