import mongoose, { Schema, Document } from 'mongoose';
import { getMemoryStore, saveMemoryStore, isDbConnected } from '../config/db';

// =========================
// MONGOOSE SCHEMAS
// =========================

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profileImage: string;
  dailyStudyGoal: number;
  preferredStudyTime: string;
  createdAt: Date;
}

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '' },
  dailyStudyGoal: { type: Number, default: 4 }, // hours
  preferredStudyTime: { type: String, default: 'Morning' }, // Morning, Afternoon, Evening, Night
  createdAt: { type: Date, default: Date.now }
});

export interface ISubject extends Document {
  userId: string;
  name: string;
  description: string;
  difficulty: string; // Easy, Medium, Hard
  priority: string; // Low, Medium, High
  color: string;
  createdAt: Date;
}

export const SubjectSchema = new Schema<ISubject>({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, default: 'Medium' },
  priority: { type: String, default: 'Medium' },
  color: { type: String, default: '#4f46e5' },
  createdAt: { type: Date, default: Date.now }
});

export interface ITopic extends Document {
  userId: string;
  subjectId: string;
  name: string;
  description: string;
  completed: boolean;
  difficulty: string;
}

export const TopicSchema = new Schema<ITopic>({
  userId: { type: String, required: true },
  subjectId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  difficulty: { type: String, default: 'Medium' }
});

export interface IStudySession extends Document {
  userId: string;
  subjectId: string;
  topicId?: string;
  title: string;
  date: Date;
  startTime: string; // e.g. "08:00 AM" or "08:00"
  endTime: string;   // e.g. "09:00 AM" or "09:00"
  duration: number;  // minutes
  type: string;      // Study, Revision, Practice, Mock Test, Break
  priority: string;  // Low, Medium, High
  completed: boolean;
}

export const StudySessionSchema = new Schema<IStudySession>({
  userId: { type: String, required: true },
  subjectId: { type: String, required: true },
  topicId: { type: String, default: null },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },
  type: { type: String, default: 'Study' },
  priority: { type: String, default: 'Medium' },
  completed: { type: Boolean, default: false }
});

export interface ITask extends Document {
  userId: string;
  subjectId?: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: string; // Low, Medium, High
  status: string;   // Todo, In Progress, Completed
  estimatedTime: number; // in minutes
}

export const TaskSchema = new Schema<ITask>({
  userId: { type: String, required: true },
  subjectId: { type: String, default: null },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  priority: { type: String, default: 'Medium' },
  status: { type: String, default: 'Todo' },
  estimatedTime: { type: Number, default: 60 }
});

export interface IExam extends Document {
  userId: string;
  subjectId: string;
  examName: string;
  examDate: Date;
  preparationPercentage: number;
  notes: string;
}

export const ExamSchema = new Schema<IExam>({
  userId: { type: String, required: true },
  subjectId: { type: String, required: true },
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
  preparationPercentage: { type: Number, default: 0 },
  notes: { type: String, default: '' }
});

export interface IPomodoro extends Document {
  userId: string;
  duration: number; // minutes
  date: Date;
  completed: boolean;
}

export const PomodoroSchema = new Schema<IPomodoro>({
  userId: { type: String, required: true },
  duration: { type: Number, default: 25 },
  date: { type: Date, default: Date.now },
  completed: { type: Boolean, default: true }
});

// Official Mongoose models registered
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const SubjectModel = mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
export const TopicModel = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
export const StudySessionModel = mongoose.models.StudySession || mongoose.model<IStudySession>('StudySession', StudySessionSchema);
export const TaskModel = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export const ExamModel = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);
export const PomodoroModel = mongoose.models.Pomodoro || mongoose.model<IPomodoro>('Pomodoro', PomodoroSchema);

// ===================================
// UNIFIED DATA REPOSITORY (DUAL-MODE)
// ===================================

function generateId(): string {
  return new mongoose.Types.ObjectId().toString();
}

export const DB = {
  User: {
    async findOne(query: { email?: string; _id?: string }) {
      if (isDbConnected()) {
        return UserModel.findOne(query).lean();
      }
      const store = getMemoryStore();
      return store.users.find(u => {
        if (query.email && u.email.toLowerCase() === query.email.toLowerCase()) return true;
        if (query._id && (u._id === query._id || u.id === query._id)) return true;
        return false;
      }) || null;
    },
    async findById(id: string) {
      return this.findOne({ _id: id });
    },
    async create(data: any) {
      if (isDbConnected()) {
        const u = await UserModel.create(data);
        return u.toObject();
      }
      const store = getMemoryStore();
      const newUser = {
        _id: generateId(),
        createdAt: new Date(),
        profileImage: '',
        dailyStudyGoal: 4,
        preferredStudyTime: 'Morning',
        ...data
      };
      store.users.push(newUser);
      saveMemoryStore();
      return newUser;
    },
    async findByIdAndUpdate(id: string, updateData: any) {
      if (isDbConnected()) {
        return UserModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      }
      const store = getMemoryStore();
      const idx = store.users.findIndex(u => u._id === id || u.id === id);
      if (idx !== -1) {
        store.users[idx] = { ...store.users[idx], ...updateData };
        saveMemoryStore();
        return store.users[idx];
      }
      return null;
    }
  },

  Subject: {
    async find(query: { userId: string }) {
      if (isDbConnected()) {
        return SubjectModel.find(query).sort({ createdAt: -1 }).lean();
      }
      const store = getMemoryStore();
      return store.subjects.filter(s => s.userId === query.userId);
    },
    async findById(id: string) {
      if (isDbConnected()) {
        return SubjectModel.findById(id).lean();
      }
      const store = getMemoryStore();
      return store.subjects.find(s => s._id === id || s.id === id) || null;
    },
    async create(data: any) {
      if (isDbConnected()) {
        const s = await SubjectModel.create(data);
        return s.toObject();
      }
      const store = getMemoryStore();
      const newSubject = {
        _id: generateId(),
        createdAt: new Date(),
        difficulty: 'Medium',
        priority: 'Medium',
        color: '#4f46e5',
        ...data
      };
      store.subjects.push(newSubject);
      saveMemoryStore();
      return newSubject;
    },
    async findByIdAndUpdate(id: string, updateData: any) {
      if (isDbConnected()) {
        return SubjectModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      }
      const store = getMemoryStore();
      const idx = store.subjects.findIndex(s => s._id === id || s.id === id);
      if (idx !== -1) {
        store.subjects[idx] = { ...store.subjects[idx], ...updateData };
        saveMemoryStore();
        return store.subjects[idx];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isDbConnected()) {
        await SubjectModel.findByIdAndDelete(id);
        await TopicModel.deleteMany({ subjectId: id });
        await StudySessionModel.deleteMany({ subjectId: id });
        await TaskModel.deleteMany({ subjectId: id });
        await ExamModel.deleteMany({ subjectId: id });
        return true;
      }
      const store = getMemoryStore();
      store.subjects = store.subjects.filter(s => s._id !== id && s.id !== id);
      store.topics = store.topics.filter(t => t.subjectId !== id);
      store.studySessions = store.studySessions.filter(s => s.subjectId !== id);
      store.tasks = store.tasks.filter(t => t.subjectId !== id);
      store.exams = store.exams.filter(e => e.subjectId !== id);
      saveMemoryStore();
      return true;
    }
  },

  Topic: {
    async find(query: { userId: string; subjectId?: string }) {
      if (isDbConnected()) {
        return TopicModel.find(query).lean();
      }
      const store = getMemoryStore();
      return store.topics.filter(t => {
        if (t.userId !== query.userId) return false;
        if (query.subjectId && t.subjectId !== query.subjectId) return false;
        return true;
      });
    },
    async findById(id: string) {
      if (isDbConnected()) {
        return TopicModel.findById(id).lean();
      }
      const store = getMemoryStore();
      return store.topics.find(t => t._id === id || t.id === id) || null;
    },
    async create(data: any) {
      if (isDbConnected()) {
        const t = await TopicModel.create(data);
        return t.toObject();
      }
      const store = getMemoryStore();
      const newTopic = {
        _id: generateId(),
        completed: false,
        difficulty: 'Medium',
        ...data
      };
      store.topics.push(newTopic);
      saveMemoryStore();
      return newTopic;
    },
    async findByIdAndUpdate(id: string, updateData: any) {
      if (isDbConnected()) {
        return TopicModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      }
      const store = getMemoryStore();
      const idx = store.topics.findIndex(t => t._id === id || t.id === id);
      if (idx !== -1) {
        store.topics[idx] = { ...store.topics[idx], ...updateData };
        saveMemoryStore();
        return store.topics[idx];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isDbConnected()) {
        return TopicModel.findByIdAndDelete(id);
      }
      const store = getMemoryStore();
      store.topics = store.topics.filter(t => t._id !== id && t.id !== id);
      saveMemoryStore();
      return true;
    }
  },

  StudySession: {
    async find(query: { userId: string; date?: any }) {
      if (isDbConnected()) {
        return StudySessionModel.find(query).sort({ date: 1, startTime: 1 }).lean();
      }
      const store = getMemoryStore();
      return store.studySessions.filter(s => s.userId === query.userId);
    },
    async findById(id: string) {
      if (isDbConnected()) {
        return StudySessionModel.findById(id).lean();
      }
      const store = getMemoryStore();
      return store.studySessions.find(s => s._id === id || s.id === id) || null;
    },
    async create(data: any) {
      if (isDbConnected()) {
        const s = await StudySessionModel.create(data);
        return s.toObject();
      }
      const store = getMemoryStore();
      const newSession = {
        _id: generateId(),
        completed: false,
        priority: 'Medium',
        type: 'Study',
        ...data
      };
      store.studySessions.push(newSession);
      saveMemoryStore();
      return newSession;
    },
    async insertMany(sessions: any[]) {
      if (isDbConnected()) {
        return StudySessionModel.insertMany(sessions);
      }
      const store = getMemoryStore();
      const formatted = sessions.map(s => ({
        _id: generateId(),
        completed: false,
        priority: 'Medium',
        type: 'Study',
        ...s
      }));
      store.studySessions.push(...formatted);
      saveMemoryStore();
      return formatted;
    },
    async findByIdAndUpdate(id: string, updateData: any) {
      if (isDbConnected()) {
        return StudySessionModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      }
      const store = getMemoryStore();
      const idx = store.studySessions.findIndex(s => s._id === id || s.id === id);
      if (idx !== -1) {
        store.studySessions[idx] = { ...store.studySessions[idx], ...updateData };
        saveMemoryStore();
        return store.studySessions[idx];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isDbConnected()) {
        return StudySessionModel.findByIdAndDelete(id);
      }
      const store = getMemoryStore();
      store.studySessions = store.studySessions.filter(s => s._id !== id && s.id !== id);
      saveMemoryStore();
      return true;
    }
  },

  Task: {
    async find(query: { userId: string; status?: string; priority?: string }) {
      if (isDbConnected()) {
        return TaskModel.find(query).sort({ dueDate: 1 }).lean();
      }
      const store = getMemoryStore();
      return store.tasks.filter(t => {
        if (t.userId !== query.userId) return false;
        if (query.status && t.status !== query.status) return false;
        if (query.priority && t.priority !== query.priority) return false;
        return true;
      });
    },
    async findById(id: string) {
      if (isDbConnected()) {
        return TaskModel.findById(id).lean();
      }
      const store = getMemoryStore();
      return store.tasks.find(t => t._id === id || t.id === id) || null;
    },
    async create(data: any) {
      if (isDbConnected()) {
        const t = await TaskModel.create(data);
        return t.toObject();
      }
      const store = getMemoryStore();
      const newTask = {
        _id: generateId(),
        status: 'Todo',
        priority: 'Medium',
        estimatedTime: 60,
        ...data
      };
      store.tasks.push(newTask);
      saveMemoryStore();
      return newTask;
    },
    async findByIdAndUpdate(id: string, updateData: any) {
      if (isDbConnected()) {
        return TaskModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      }
      const store = getMemoryStore();
      const idx = store.tasks.findIndex(t => t._id === id || t.id === id);
      if (idx !== -1) {
        store.tasks[idx] = { ...store.tasks[idx], ...updateData };
        saveMemoryStore();
        return store.tasks[idx];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isDbConnected()) {
        return TaskModel.findByIdAndDelete(id);
      }
      const store = getMemoryStore();
      store.tasks = store.tasks.filter(t => t._id !== id && t.id !== id);
      saveMemoryStore();
      return true;
    }
  },

  Exam: {
    async find(query: { userId: string }) {
      if (isDbConnected()) {
        return ExamModel.find(query).sort({ examDate: 1 }).lean();
      }
      const store = getMemoryStore();
      return store.exams.filter(e => e.userId === query.userId).sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    },
    async findById(id: string) {
      if (isDbConnected()) {
        return ExamModel.findById(id).lean();
      }
      const store = getMemoryStore();
      return store.exams.find(e => e._id === id || e.id === id) || null;
    },
    async create(data: any) {
      if (isDbConnected()) {
        const e = await ExamModel.create(data);
        return e.toObject();
      }
      const store = getMemoryStore();
      const newExam = {
        _id: generateId(),
        preparationPercentage: 0,
        notes: '',
        ...data
      };
      store.exams.push(newExam);
      saveMemoryStore();
      return newExam;
    },
    async findByIdAndUpdate(id: string, updateData: any) {
      if (isDbConnected()) {
        return ExamModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      }
      const store = getMemoryStore();
      const idx = store.exams.findIndex(e => e._id === id || e.id === id);
      if (idx !== -1) {
        store.exams[idx] = { ...store.exams[idx], ...updateData };
        saveMemoryStore();
        return store.exams[idx];
      }
      return null;
    },
    async findByIdAndDelete(id: string) {
      if (isDbConnected()) {
        return ExamModel.findByIdAndDelete(id);
      }
      const store = getMemoryStore();
      store.exams = store.exams.filter(e => e._id !== id && e.id !== id);
      saveMemoryStore();
      return true;
    }
  },

  Pomodoro: {
    async find(query: { userId: string }) {
      if (isDbConnected()) {
        return PomodoroModel.find(query).sort({ date: -1 }).lean();
      }
      const store = getMemoryStore();
      return store.pomodoros.filter(p => p.userId === query.userId);
    },
    async create(data: any) {
      if (isDbConnected()) {
        const p = await PomodoroModel.create(data);
        return p.toObject();
      }
      const store = getMemoryStore();
      const newPomodoro = {
        _id: generateId(),
        date: new Date(),
        completed: true,
        duration: 25,
        ...data
      };
      store.pomodoros.push(newPomodoro);
      saveMemoryStore();
      return newPomodoro;
    }
  }
};
