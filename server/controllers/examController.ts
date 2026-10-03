import { Response } from 'express';
import { DB } from '../models/index';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getExams(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const exams = await DB.Exam.find({ userId });
    const subjects = await DB.Subject.find({ userId });
    const subjectMap = new Map(subjects.map(s => [s._id || s.id, s]));

    const now = new Date().getTime();

    const enhanced = exams.map(e => {
      const examTime = new Date(e.examDate).getTime();
      const diffMs = Math.max(0, examTime - now);

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      const sub = subjectMap.get(e.subjectId);

      return {
        ...e,
        subjectName: sub ? sub.name : 'Exam',
        subjectColor: sub ? sub.color : '#ec4899',
        countdown: {
          days,
          hours,
          minutes,
          seconds,
          isPassed: diffMs === 0
        }
      };
    });

    return res.json(enhanced);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch exams', error: err.message });
  }
}

export async function createExam(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { subjectId, examName, examDate, preparationPercentage, notes } = req.body;

    if (!subjectId || !examName || !examDate) {
      return res.status(400).json({ message: 'Subject, exam name, and exam date are required' });
    }

    const newExam = await DB.Exam.create({
      userId,
      subjectId,
      examName: examName.trim(),
      examDate: new Date(examDate),
      preparationPercentage: Number(preparationPercentage) || 0,
      notes: notes || ''
    });

    return res.status(201).json(newExam);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create exam', error: err.message });
  }
}

export async function updateExam(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const exam = await DB.Exam.findById(id);
    if (!exam || exam.userId !== userId) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const { subjectId, examName, examDate, preparationPercentage, notes } = req.body;
    const updateData: any = {};
    if (subjectId !== undefined) updateData.subjectId = subjectId;
    if (examName !== undefined) updateData.examName = examName.trim();
    if (examDate !== undefined) updateData.examDate = new Date(examDate);
    if (preparationPercentage !== undefined) updateData.preparationPercentage = Number(preparationPercentage);
    if (notes !== undefined) updateData.notes = notes;

    const updated = await DB.Exam.findByIdAndUpdate(id, updateData);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update exam', error: err.message });
  }
}

export async function deleteExam(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const exam = await DB.Exam.findById(id);
    if (!exam || exam.userId !== userId) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    await DB.Exam.findByIdAndDelete(id);
    return res.json({ message: 'Exam deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete exam', error: err.message });
  }
}
