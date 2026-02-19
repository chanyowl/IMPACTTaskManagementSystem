# What to Expect - Crystell User Journey

## 🎬 First Launch

### 1. Onboarding Screen
When you first open http://localhost:5173, you'll see:
- Beautiful gradient background (blue to purple)
- "Hi! I'm Crystell" heading
- Explanation of the three core principles:
  - 💭 I learn by observing
  - 🌊 Low pressure, always
  - 🪞 I'm your mirror
- "Let's get started" button

### 2. First Chat
After clicking the button, you'll see:
- **Header**: Blue gradient with "Crystell" title
- **Main Area**: Chat interface (like iMessage/WhatsApp)
- **Sidebar**: Task insights panel (right side)
- **Welcome Message**: "Hi! I'm Crystell. Just dump everything that's on your mind right now—work, life, chores. Messy is fine."

## 💬 Conversation Flow

### Example First Message
**You type:**
```
I need to finish my quarterly report, fix that bug in the payment system,
call mom, and go grocery shopping
```

**Crystell responds:**
```
Okay, I see about 4 distinct things there. Let me help you think through these.

The quarterly report sounds like it might be weighing on you—is that the one
taking up the most space in your head right now?
```

**Behind the scenes:**
- ✅ 4 tasks extracted and saved to Firestore
- ✅ Each task categorized:
  - "Quarterly report" → High cognitive load, neutral weight
  - "Fix bug" → High cognitive load, neutral weight
  - "Call mom" → Low cognitive load, neutral weight
  - "Grocery shopping" → Low cognitive load, neutral weight
- ✅ Your response time recorded (energy inference)
- ✅ Sentiment analyzed

### After 3-4 Messages
The **"Suggest a Task"** button appears in the sidebar!

### Getting a Suggestion
**Click "Suggest a Task"**

You'll see a card with:
- **Task description**: e.g., "Finish quarterly report"
- **Reasoning**: "You seem energized right now, which is perfect for diving into this task. Morning is typically great for focused work."
- **Tags**: creative, high-cognitive
- **Badge**: "Deep work"
- **Three buttons**:
  - 🟦 **Start Now** - Marks task as completed
  - ⬜ **Not Today** - Snoozes the task (increases resistance score)
  - ❌ **Wrong Read** - Corrects Crystell's understanding

## 🎯 Smart Recommendations

### Morning (9 AM) + High Energy
Crystell suggests:
- ✅ "Finish quarterly report" (deep work)
- ✅ "Fix payment bug" (requires focus)

### Afternoon (3 PM) + Low Energy
Crystell suggests:
- ✅ "Call mom" (light task)
- ✅ "Grocery shopping" (simple, doesn't require deep thinking)

### Anxious Mood
Crystell says:
```
I'm noticing you seem a bit stressed. Maybe we start with something
straightforward? How about calling mom—that's usually a nice break
from work pressure.
```

## 📊 Pattern Recognition (After 3+ Days)

Crystell might say:
```
I've noticed you tend to avoid email tasks on Monday mornings.
What is it about Mondays that makes emails feel harder?
```

Or:
```
You usually crush writing tasks around 10 AM. It's 9:55 now—
want to tackle that report while you're in your sweet spot?
```

## 🔄 Learning Loop

### When You Click "Start Now"
```
Crystell: Great! Let me know how it goes with "Fix payment bug".
I'm here if you need to talk through anything.
```
- ✅ Task marked as completed
- ✅ Confidence in suggesting similar tasks increases

### When You Click "Not Today"
```
Crystell: No problem. We'll save that for another time.
What does feel doable right now?
```
- ✅ Task resistance score increased
- ✅ System learns you're avoiding this type of task
- ✅ Future suggestions adjusted

### When You Click "Wrong Read"
```
Crystell: Thanks for letting me know I misread that.
Can you help me understand what I got wrong?
```
- ✅ Feedback recorded
- ✅ Understanding refined

## 🎨 UI/UX Details

### Message Bubbles
- **Your messages**: Blue bubble, right-aligned
- **Crystell's messages**: Gray bubble, left-aligned
- **Timestamps**: Small text below each message

### Task Suggestion Card
- Beautiful gradient background (blue to indigo)
- Clean, modern design
- Color-coded tags
- Smooth hover effects on buttons

### Loading States
- Three animated dots when Crystell is "thinking"
- Button disabled states while processing

## 🔍 Technical Features You'll Notice

### Real-time Sync
- Messages save to Firestore instantly
- Can refresh page without losing conversation

### Fast Responses
- Claude API typically responds in 1-3 seconds
- Task extraction happens simultaneously with chat

### Smart Context
- Crystell remembers the last 10 messages
- References earlier conversation naturally

### Error Handling
- If backend is down: "I'm having trouble connecting right now..."
- If no tasks available: "You don't have any pending tasks yet..."

## 📱 Browser Experience

### Recommended Browser
- Chrome, Edge, or Firefox (latest versions)

### Screen Size
- Desktop: Full sidebar experience
- Mobile: Responsive (though not optimized for mobile in MVP)

### Developer Console
You'll see helpful logs:
```
✅ Firebase initialized
Sending message to Crystell...
Received response from Crystell
```

## 🚀 Performance Expectations

### First Message
- ~2-3 seconds for Crystell to respond
- Task extraction happens in parallel

### Subsequent Messages
- ~1-2 seconds (faster as conversation context builds)

### Task Suggestion
- ~1 second to calculate and display

### Database Operations
- Instant (Firestore real-time sync)

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ Onboarding screen loads with pretty gradients
2. ✅ You can type and send messages
3. ✅ Crystell responds conversationally (not robotic)
4. ✅ "Suggest a Task" button appears after a few messages
5. ✅ Task suggestions feel relevant to your current state
6. ✅ Backend terminal shows no errors
7. ✅ Browser console shows Firebase initialized

## 🌟 The "Wow" Moments

### When you realize...
- 🤯 Crystell actually understood your messy task dump
- 🤯 The suggestion matches your current mood
- 🤯 It noticed you avoid certain tasks
- 🤯 It referenced something you said 5 messages ago
- 🤯 It's not nagging you—just gently suggesting

### The difference from other apps...
- ❌ No rigid deadlines
- ❌ No guilt-inducing "overdue" labels
- ❌ No gamification or streaks
- ✅ Just calm, empathetic conversation
- ✅ Suggestions that adapt to YOU

---

**Ready to experience it?**

Follow [START_HERE.md](START_HERE.md) to launch Crystell! 🚀
