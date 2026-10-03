import { Response } from 'express';
import { DB } from '../models/index';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateSmartStudyPlan } from '../services/studyPlanGenerator';

export async function getSessions(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { date, today } = req.query;

    const sessions = await DB.StudySession.find({ userId });
    const subjects = await DB.Subject.find({ userId });
    const topics = await DB.Topic.find({ userId });

    const subjectMap = new Map(subjects.map(s => [s._id || s.id, s]));
    const topicMap = new Map(topics.map(t => [t._id || t.id, t]));

    let filtered = sessions;

    if (today === 'true') {
      const todayStr = new Date().toISOString().split('T')[0];
      filtered = sessions.filter(s => {
        const sDate = s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date).split('T')[0];
        return sDate === todayStr;
      });
    } else if (date) {
      const queryDateStr = String(date).split('T')[0];
      filtered = sessions.filter(s => {
        const sDate = s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date).split('T')[0];
        return sDate === queryDateStr;
      });
    }

    const enhanced = filtered.map(s => {
      const sub = subjectMap.get(s.subjectId);
      const top = s.topicId ? topicMap.get(s.topicId) : null;
      return {
        ...s,
        subjectName: sub ? sub.name : 'General Study',
        subjectColor: sub ? sub.color : '#6366f1',
        topicName: top ? top.name : ''
      };
    });

    return res.json(enhanced);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch study sessions', error: err.message });
  }
}

export async function createSession(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { subjectId, topicId, title, date, startTime, endTime, duration, type, priority, completed } = req.body;

    if (!subjectId || !title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Subject, title, date, startTime, and endTime are required' });
    }

    const session = await DB.StudySession.create({
      userId,
      subjectId,
      topicId: topicId || null,
      title: title.trim(),
      date: new Date(date),
      startTime,
      endTime,
      duration: Number(duration) || 60,
      type: type || 'Study',
      priority: priority || 'Medium',
      completed: Boolean(completed)
    });

    return res.status(201).json(session);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create study session', error: err.message });
  }
}

export async function generateSmartPlan(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      subjectIds,
      examDate,
      availableHoursPerDay,
      weakSubjectIds,
      preferredStudyTime,
      studyDays,
      dailyGoalHours,
      saveToDatabase = true
    } = req.body;

    const allSubjects = await DB.Subject.find({ userId });
    const allTopics = await DB.Topic.find({ userId });

    const selectedSubjects = subjectIds && subjectIds.length > 0
      ? allSubjects.filter(s => subjectIds.includes(s._id || s.id))
      : allSubjects;

    if (selectedSubjects.length === 0) {
      return res.status(400).json({ message: 'Please create or select at least one subject first.' });
    }

    const generated = generateSmartStudyPlan({
      userId,
      subjects: selectedSubjects,
      topics: allTopics,
      examDate,
      availableHoursPerDay: Number(availableHoursPerDay) || 4,
      weakSubjectIds: weakSubjectIds || [],
      preferredStudyTime: preferredStudyTime || 'Morning',
      studyDays: studyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      dailyGoalHours: Number(dailyGoalHours) || 4,
      planDurationDays: 7
    });

    if (saveToDatabase && generated.length > 0) {
      const toInsert = generated.map(g => ({
        userId,
        subjectId: g.subjectId,
        topicId: g.topicId || null,
        title: g.title,
        date: new Date(g.date),
        startTime: g.startTime,
        endTime: g.endTime,
        duration: g.duration,
        type: g.type,
        priority: g.priority,
        completed: false
      }));

      const saved = await DB.StudySession.insertMany(toInsert);
      return res.status(201).json({
        message: `Successfully generated and scheduled ${saved.length} study sessions!`,
        count: saved.length,
        sessions: generated
      });
    }

    return res.json({
      message: `Generated ${generated.length} sessions for review`,
      sessions: generated
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to generate study plan', error: err.message });
  }
}

export async function updateSession(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const session = await DB.StudySession.findById(id);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    const { completed, title, date, startTime, endTime, duration, type, priority } = req.body;
    const updateData: any = {};
    if (completed !== undefined) updateData.completed = Boolean(completed);
    if (title !== undefined) updateData.title = title.trim();
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (duration !== undefined) updateData.duration = Number(duration);
    if (type !== undefined) updateData.type = type;
    if (priority !== undefined) updateData.priority = priority;

    const updated = await DB.StudySession.findByIdAndUpdate(id, updateData);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update study session', error: err.message });
  }
}

export async function deleteSession(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const session = await DB.StudySession.findById(id);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    await DB.StudySession.findByIdAndDelete(id);
    return res.json({ message: 'Study session deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete study session', error: err.message });
  }
}
