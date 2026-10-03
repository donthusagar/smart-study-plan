import { Response } from 'express';
import { DB } from '../models/index';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getSubjects(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const subjects = await DB.Subject.find({ userId });
    const allTopics = await DB.Topic.find({ userId });

    // Compute progress for each subject
    const enhanced = subjects.map(s => {
      const subjectTopics = allTopics.filter(t => t.subjectId === s._id || t.subjectId === s.id);
      const totalTopics = subjectTopics.length;
      const completedTopics = subjectTopics.filter(t => t.completed).length;
      const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        ...s,
        totalTopics,
        completedTopics,
        progress
      };
    });

    return res.json(enhanced);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
  }
}

export async function getSubjectById(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const subject = await DB.Subject.findById(id);
    if (!subject || subject.userId !== userId) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const topics = await DB.Topic.find({ userId, subjectId: id });
    const totalTopics = topics.length;
    const completedTopics = topics.filter(t => t.completed).length;
    const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return res.json({
      ...subject,
      topics,
      totalTopics,
      completedTopics,
      progress
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch subject', error: err.message });
  }
}

export async function createSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { name, description, difficulty, priority, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const newSubject = await DB.Subject.create({
      userId,
      name: name.trim(),
      description: description || '',
      difficulty: difficulty || 'Medium',
      priority: priority || 'Medium',
      color: color || '#3b82f6',
      createdAt: new Date()
    });

    return res.status(201).json({
      ...newSubject,
      totalTopics: 0,
      completedTopics: 0,
      progress: 0
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create subject', error: err.message });
  }
}

export async function updateSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const subject = await DB.Subject.findById(id);

    if (!subject || subject.userId !== userId) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const { name, description, difficulty, priority, color } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (priority !== undefined) updateData.priority = priority;
    if (color !== undefined) updateData.color = color;

    const updated = await DB.Subject.findByIdAndUpdate(id, updateData);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update subject', error: err.message });
  }
}

export async function deleteSubject(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const subject = await DB.Subject.findById(id);

    if (!subject || subject.userId !== userId) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await DB.Subject.findByIdAndDelete(id);
    return res.json({ message: 'Subject and related topics deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete subject', error: err.message });
  }
}
