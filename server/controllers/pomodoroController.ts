import { Response } from 'express';
import { DB } from '../models/index';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getPomodoros(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const pomodoros = await DB.Pomodoro.find({ userId });
    return res.json(pomodoros);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch pomodoro history', error: err.message });
  }
}

export async function createPomodoro(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { duration, completed } = req.body;

    const newPomodoro = await DB.Pomodoro.create({
      userId,
      duration: Number(duration) || 25,
      completed: completed !== undefined ? Boolean(completed) : true,
      date: new Date()
    });

    return res.status(201).json(newPomodoro);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to record pomodoro session', error: err.message });
  }
}
