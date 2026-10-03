export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  dailyStudyGoal: number;
  preferredStudyTime: string;
  createdAt?: string;
}

export interface Subject {
  _id: string;
  name: string;
  description?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priority: 'Low' | 'Medium' | 'High';
  color: string;
  createdAt?: string;
  totalTopics?: number;
  completedTopics?: number;
  progress?: number;
}

export interface Topic {
  _id: string;
  subjectId: string;
  name: string;
  description?: string;
  completed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface StudySession {
  _id: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  topicId?: string;
  topicName?: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  type: 'Study' | 'Revision' | 'Practice' | 'Mock Test' | 'Break';
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
}

export interface Task {
  _id: string;
  subjectId?: string;
  subjectName?: string;
  subjectColor?: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Completed';
  estimatedTime: number; // minutes
}

export interface Exam {
  _id: string;
  subjectId: string;
  subjectName?: string;
  subjectColor?: string;
  examName: string;
  examDate: string;
  preparationPercentage: number;
  notes?: string;
  countdown?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPassed: boolean;
  };
}

export interface DashboardData {
  userName: string;
  totalSubjects: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  studyHours: number;
  studyHoursGrowth: string;
  upcomingExams: number;
  currentStreak: number;
  longestStreak: number;
  dailyStudyGoal: number;
  weeklyProgress: Array<{ day: string; hours: number; target: number }>;
  todaySessions: StudySession[];
}

export interface ProgressData {
  totalStudyHours: number;
  averageDailyHours: number;
  tasksCompleted: number;
  totalTasks: number;
  taskCompletionRate: number;
  topicsCompleted: number;
  totalTopics: number;
  topicCompletionRate: number;
  sessionsCompleted: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  subjectProgress: Array<{
    id: string;
    name: string;
    color: string;
    totalTopics: number;
    completedTopics: number;
    percentage: number;
    studyHours: number;
  }>;
  weeklyStudyHours: Array<{
    day: string;
    date: string;
    study: number;
    revision: number;
    practice: number;
    total: number;
  }>;
  dailyActivity: Array<{
    date: string;
    day: string;
    hours: number;
    sessionsCount: number;
  }>;
  tasksBreakdown: Array<{
    name: string;
    count: number;
    color: string;
  }>;
}

export interface PomodoroRecord {
  _id: string;
  userId: string;
  duration: number;
  date: string;
  completed: boolean;
}
