import { Response } from 'express';
import { DB } from '../models/index';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getTasks(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { status, priority, subjectId } = req.query;

    const tasks = await DB.Task.find({ userId });
    const subjects = await DB.Subject.find({ userId });
    const subjectMap = new Map(subjects.map(s => [s._id || s.id, s]));

    let filtered = tasks;

    if (status && status !== 'All') {
      filtered = filtered.filter(t => t.status === status);
    }
    if (priority && priority !== 'All') {
      filtered = filtered.filter(t => t.priority === priority);
    }
    if (subjectId) {
      filtered = filtered.filter(t => t.subjectId === subjectId);
    }

    const enhanced = filtered.map(t => {
      const sub = t.subjectId ? subjectMap.get(t.subjectId) : null;
      return {
        ...t,
        subjectName: sub ? sub.name : 'General',
        subjectColor: sub ? sub.color : '#6b7280'
      };
    });

    return res.json(enhanced);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
}

export async function createTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { subjectId, title, description, dueDate, priority, status, estimatedTime } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }

    const newTask = await DB.Task.create({
      userId,
      subjectId: subjectId || null,
      title: title.trim(),
      description: description || '',
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      status: status || 'Todo',
      estimatedTime: Number(estimatedTime) || 60
    });

    let subjectName = 'General';
    let subjectColor = '#6b7280';
    if (subjectId) {
      const sub = await DB.Subject.findById(subjectId);
      if (sub) {
        subjectName = sub.name;
        subjectColor = sub.color;
      }
    }

    return res.status(201).json({
      ...newTask,
      subjectName,
      subjectColor
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
}

export async function updateTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await DB.Task.findById(id);
    if (!task || task.userId !== userId) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { subjectId, title, description, dueDate, priority, status, estimatedTime } = req.body;
    const updateData: any = {};
    if (subjectId !== undefined) updateData.subjectId = subjectId;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (estimatedTime !== undefined) updateData.estimatedTime = Number(estimatedTime);

    const updated = await DB.Task.findByIdAndUpdate(id, updateData);

    let subjectName = 'General';
    let subjectColor = '#6b7280';
    if (updated.subjectId) {
      const sub = await DB.Subject.findById(updated.subjectId);
      if (sub) {
        subjectName = sub.name;
        subjectColor = sub.color;
      }
    }

    return res.json({
      ...updated,
      subjectName,
      subjectColor
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const task = await DB.Task.findById(id);
    if (!task || task.userId !== userId) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await DB.Task.findByIdAndDelete(id);
    return res.json({ message: 'Task deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
}
