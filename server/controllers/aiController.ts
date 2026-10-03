import { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { DB } from '../models/index';
import { AuthenticatedRequest } from '../middleware/auth';

let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

export async function chatWithAI(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Retrieve real student context from database
    const [user, subjects, topics, exams, sessions, tasks] = await Promise.all([
      DB.User.findById(userId),
      DB.Subject.find({ userId }),
      DB.Topic.find({ userId }),
      DB.Exam.find({ userId }),
      DB.StudySession.find({ userId }),
      DB.Task.find({ userId })
    ]);

    const studentName = user?.name || 'Student';
    const pendingTopics = topics.filter(t => !t.completed).map(t => `${t.name} (${t.difficulty})`).slice(0, 10);
    const completedTopics = topics.filter(t => t.completed).map(t => t.name).slice(0, 8);
    const subjectNames = subjects.map(s => `${s.name} [Diff: ${s.difficulty}, Priority: ${s.priority}]`).join(', ');
    const upcomingExams = exams.map(e => `${e.examName} on ${new Date(e.examDate).toLocaleDateString()} (Prep: ${e.preparationPercentage}%)`).join('; ');
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').map(t => `${t.title} [Due: ${new Date(t.dueDate).toLocaleDateString()}]`).slice(0, 5).join('; ');

    const promptText = message.trim();

    // Check if Gemini API client is available and has key
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are the AI Academic Study Advisor for "${studentName}", a college student using Smart Study Planner.
Your role: Provide concise, highly actionable, encouraging, and structured study advice based on their real academic data.
Student Context:
- Enrolled Subjects: ${subjectNames || 'General Engineering'}
- Incomplete Topics to Learn: ${pendingTopics.join(', ') || 'Various core topics'}
- Completed Topics: ${completedTopics.join(', ') || 'Introductory modules'}
- Upcoming Examinations: ${upcomingExams || 'Midterms approaching'}
- Pending Tasks/Assignments: ${pendingTasks || 'None pending'}
- Daily Study Target: ${user?.dailyStudyGoal || 4} hours/day
- Preferred Study Period: ${user?.preferredStudyTime || 'Morning'}

Guidelines:
1. Always reference specific subjects and topics from their data when answering.
2. Structure study sessions with realistic time blocks (e.g., 45-60 min focus + 15 min break).
3. Keep answers clear, well-formatted with markdown bullet points and bold highlights.
4. When asked "What should I study today?", prioritize high-difficulty or nearest-exam subjects.
5. If asked to explain a topic, give a crisp, intuitive college-level explanation with an example.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: promptText,
          config: {
            systemInstruction,
            temperature: 0.7
          }
        });

        const reply = response.text || "I'm ready to help you plan your study sessions!";
        return res.json({ reply, source: 'gemini-3.8-flash' });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, switching to contextual intelligent fallback:', geminiError.message);
      }
    }

    // High quality intelligent academic fallback engine
    const reply = generateContextualFallbackReply({
      promptText,
      studentName,
      subjects,
      topics,
      exams,
      sessions,
      tasks
    });

    return res.json({ reply, source: 'rule-assistant' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to process AI request', error: err.message });
  }
}

function generateContextualFallbackReply(ctx: {
  promptText: string;
  studentName: string;
  subjects: any[];
  topics: any[];
  exams: any[];
  sessions: any[];
  tasks: any[];
}): string {
  const q = ctx.promptText.toLowerCase();
  const subNames = ctx.subjects.map(s => s.name);
  const pendingT = ctx.topics.filter(t => !t.completed);
  const nextExam = ctx.exams[0];

  if (q.includes('what should i study today') || q.includes('study today') || q.includes('today')) {
    const primarySub = ctx.subjects.find(s => s.priority === 'High' || s.difficulty === 'Hard') || ctx.subjects[0];
    const secondarySub = ctx.subjects.find(s => s._id !== primarySub?._id) || ctx.subjects[1] || primarySub;
    const pTopic = pendingT.find(t => t.subjectId === primarySub?._id)?.name || 'Core Problem Set';
    const sTopic = pendingT.find(t => t.subjectId === secondarySub?._id)?.name || 'Theory Review';

    return `Based on your upcoming exams and current progress, here is my recommended blueprint for today:

• **Slot 1 (08:30 AM - 09:30 AM)**: **${primarySub?.name || 'Mathematics'}** – Focus on *${pTopic}* (60 mins deep focus).
• **Break (09:30 AM - 09:45 AM)**: Hydrate & step away from screens (15 mins).
• **Slot 2 (10:00 AM - 11:00 AM)**: **${secondarySub?.name || 'Physics'}** – Practice questions on *${sTopic}* (60 mins).
• **Evening Wind-down (05:00 PM)**: Review Flashcards & 1 Pomodoro session (25 mins).

🎯 *Tip:* You have ${nextExam ? `your **${nextExam.examName}** in ${Math.ceil((new Date(nextExam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'important deadlines approaching'}. Prioritize high-weightage topics first!`;
  }

  if (q.includes('missed') || q.includes('yesterday') || q.includes('catch up')) {
    return `Don't stress about yesterday's missed session! Consistency over time matters far more than a single day:

1. **Do not double your study hours today** – that causes burnout.
2. **Re-allocate missed topics**: Move 30 minutes of yesterday's hardest topic into this weekend's revision slot.
3. **Use the 20/80 Rule**: Review just the summary formulas or concept diagrams for 20 minutes before starting today's planned agenda.
4. **Complete 1 Pomodoro right now**: Getting started eliminates the backlog anxiety.`;
  }

  if (q.includes('revision plan') || q.includes('revision')) {
    return `Here is a high-yield **Spaced Repetition Revision Plan**:

• **Day 1 (Immediate Review)**: Spend 15 minutes right after a study session summarizing key theorems in your own words.
• **Day 3 (Active Recall)**: Solve 3 unguided practice problems without looking at solutions.
• **Day 7 (Cross-Subject Drill)**: Mix problems from **${subNames.slice(0, 3).join(' and ') || 'all subjects'}** to build exam agility.
• **Day 14 (Mock Test)**: Sit for a 45-minute timed quiz on the module.`;
  }

  if (q.includes('exam plan') || q.includes('7-day') || q.includes('7 day') || q.includes('plan')) {
    return `Here is your strategic **7-Day Exam Sprint Protocol**:

| Days | Focus Area | Recommended Allocation |
| :--- | :--- | :--- |
| **Days 1–2** | High-Weightage Concept Gaps | 70% Learning, 30% Examples |
| **Days 3–4** | Numerical & Problem Solving | 50% Formulas, 50% Practice |
| **Day 5** | Full Syllabus Timed Mock Exam | Simulation under real conditions |
| **Day 6** | Error Log Analysis & Weak Spots | Review missed questions only |
| **Day 7** | Light Formula Recall & Rest | Zero heavy cramming, sleep 8 hrs |`;
  }

  if (q.includes('explain') || q.includes('what is') || q.includes('how to')) {
    return `**Concept Breakdown & College Study Framework:**

1. **The Core Intuition**: Break down the topic into its simplest mechanical definition. Ask yourself: *"What problem does this solve in engineering or science?"*
2. **Key Mathematical/Logical Formula**: Identify the 2–3 governing equations or core algorithms that appear repeatedly in past exam papers.
3. **Common Exam Trap**: Examiners frequently test edge cases and boundary conditions. Always test zero, infinity, or empty states.
4. **Action Step**: Write a 3-bullet summary in your notes and solve 1 typical university question.`;
  }

  return `Hello **${ctx.studentName}**! I'm your Smart Study Planner AI Assistant.

I am analyzing your profile:
• **${ctx.subjects.length} Subjects enrolled**: ${subNames.join(', ') || 'Setup your subjects'}
• **${pendingT.length} Topics pending**
• **${ctx.exams.length} Upcoming Examinations**

You can ask me:
1. *"What should I study today?"*
2. *"Create a revision plan for ${subNames[0] || 'Mathematics'}"*
3. *"I missed yesterday's session, how do I catch up?"*
4. *"Create a 7-day exam sprint plan"*
5. *"Explain a difficult topic"*`;
}
