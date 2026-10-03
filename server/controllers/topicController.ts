import { Response } from 'express';
import { DB } from '../models/index';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getTopics(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { subjectId } = req.query;

    const query: any = { userId };
    if (subjectId) {
      query.subjectId = String(subjectId);
    }

    const topics = await DB.Topic.find(query);
    return res.json(topics);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch topics', error: err.message });
  }
}

export async function createTopic(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { subjectId, name, description, difficulty, completed } = req.body;

    if (!subjectId || !name || !name.trim()) {
      return res.status(400).json({ message: 'Subject ID and topic name are required' });
    }

    const subject = await DB.Subject.findById(subjectId);
    if (!subject || subject.userId !== userId) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const newTopic = await DB.Topic.create({
      userId,
      subjectId,
      name: name.trim(),
      description: description || '',
      completed: Boolean(completed),
      difficulty: difficulty || 'Medium'
    });

    return res.status(201).json(newTopic);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create topic', error: err.message });
  }
}

export async function updateTopic(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const topic = await DB.Topic.findById(id);
    if (!topic || topic.userId !== userId) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const { name, description, completed, difficulty } = req.body;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = Boolean(completed);
    if (difficulty !== undefined) updateData.difficulty = difficulty;

    const updated = await DB.Topic.findByIdAndUpdate(id, updateData);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update topic', error: err.message });
  }
}

export async function deleteTopic(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const topic = await DB.Topic.findById(id);
    if (!topic || topic.userId !== userId) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    await DB.Topic.findByIdAndDelete(id);
    return res.json({ message: 'Topic deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete topic', error: err.message });
  }
}
