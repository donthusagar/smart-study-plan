import bcrypt from 'bcryptjs';
import { DB } from '../models/index';

export async function seedDemoData() {
  const existingUser = await DB.User.findOne({ email: 'sagar@college.edu' });
  if (existingUser) {
    return existingUser;
  }

  console.log('🌱 Seeding demo data for Sagar...');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const user = await DB.User.create({
    name: 'Sagar',
    email: 'sagar@college.edu',
    password: hashedPassword,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    dailyStudyGoal: 4,
    preferredStudyTime: 'Morning',
    createdAt: new Date()
  });

  const userId = user._id;

  // 1. Subjects
  const math = await DB.Subject.create({
    userId,
    name: 'Mathematics',
    description: 'Engineering Calculus, Linear Algebra, and Discrete Math',
    difficulty: 'Hard',
    priority: 'High',
    color: '#3b82f6', // blue
    createdAt: new Date()
  });

  const physics = await DB.Subject.create({
    userId,
    name: 'Physics',
    description: 'Classical Mechanics, Electromagnetism & Modern Quantum Theory',
    difficulty: 'Hard',
    priority: 'High',
    color: '#8b5cf6', // purple
    createdAt: new Date()
  });

  const cs = await DB.Subject.create({
    userId,
    name: 'Computer Science',
    description: 'Data Structures, Algorithms, Operating Systems & Web Dev',
    difficulty: 'Medium',
    priority: 'High',
    color: '#10b981', // emerald
    createdAt: new Date()
  });

  const english = await DB.Subject.create({
    userId,
    name: 'English',
    description: 'Technical Writing, Professional Communication & Presentation Skills',
    difficulty: 'Easy',
    priority: 'Medium',
    color: '#f59e0b', // amber
    createdAt: new Date()
  });

  // 2. Topics for each subject
  // Math topics
  const tMath1 = await DB.Topic.create({ userId, subjectId: math._id, name: 'Algebra & Matrices', completed: true, difficulty: 'Medium' });
  const tMath2 = await DB.Topic.create({ userId, subjectId: math._id, name: 'Linear Equations & Determinants', completed: true, difficulty: 'Medium' });
  const tMath3 = await DB.Topic.create({ userId, subjectId: math._id, name: 'Calculus: Derivatives & Integrals', completed: false, difficulty: 'Hard' });
  const tMath4 = await DB.Topic.create({ userId, subjectId: math._id, name: 'Probability & Statistics', completed: false, difficulty: 'Medium' });
  const tMath5 = await DB.Topic.create({ userId, subjectId: math._id, name: 'Differential Equations', completed: false, difficulty: 'Hard' });

  // Physics topics
  const tPhy1 = await DB.Topic.create({ userId, subjectId: physics._id, name: 'Mechanics & Newton Laws', completed: true, difficulty: 'Medium' });
  const tPhy2 = await DB.Topic.create({ userId, subjectId: physics._id, name: 'Thermodynamics & Heat Transfer', completed: true, difficulty: 'Hard' });
  const tPhy3 = await DB.Topic.create({ userId, subjectId: physics._id, name: 'Electromagnetism & Circuits', completed: false, difficulty: 'Hard' });
  const tPhy4 = await DB.Topic.create({ userId, subjectId: physics._id, name: 'Optics & Wave Motion', completed: false, difficulty: 'Medium' });

  // Computer Science topics
  const tCs1 = await DB.Topic.create({ userId, subjectId: cs._id, name: 'JavaScript & Modern ES6+', completed: true, difficulty: 'Easy' });
  const tCs2 = await DB.Topic.create({ userId, subjectId: cs._id, name: 'Data Structures: Trees & Graphs', completed: true, difficulty: 'Hard' });
  const tCs3 = await DB.Topic.create({ userId, subjectId: cs._id, name: 'Operating Systems & Concurrency', completed: false, difficulty: 'Hard' });
  const tCs4 = await DB.Topic.create({ userId, subjectId: cs._id, name: 'Database Management Systems (SQL & NoSQL)', completed: false, difficulty: 'Medium' });

  // English topics
  const tEng1 = await DB.Topic.create({ userId, subjectId: english._id, name: 'Communication Skills', completed: true, difficulty: 'Easy' });
  const tEng2 = await DB.Topic.create({ userId, subjectId: english._id, name: 'Technical Report Writing', completed: true, difficulty: 'Medium' });
  const tEng3 = await DB.Topic.create({ userId, subjectId: english._id, name: 'Viva & Interview Skills', completed: false, difficulty: 'Easy' });

  // 3. Exams
  const now = new Date();
  const examMathDate = new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000); // 17 days
  const examPhyDate = new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000);  // 22 days
  const examCsDate = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);   // 28 days

  await DB.Exam.create({
    userId,
    subjectId: math._id,
    examName: 'Mathematics Final Exam',
    examDate: examMathDate,
    preparationPercentage: 75,
    notes: 'Focus on Double Integrals, Eigenvectors, and Differential Equations.'
  });

  await DB.Exam.create({
    userId,
    subjectId: physics._id,
    examName: 'Engineering Physics Midterm',
    examDate: examPhyDate,
    preparationPercentage: 60,
    notes: 'Revise Maxwell equations and numerical problems from Chapter 4.'
  });

  await DB.Exam.create({
    userId,
    subjectId: cs._id,
    examName: 'Computer Science Practical & Theory',
    examDate: examCsDate,
    preparationPercentage: 85,
    notes: 'Review Graph algorithms and Operating System deadlock detection.'
  });

  // 4. Tasks
  await DB.Task.create({
    userId,
    subjectId: math._id,
    title: 'Complete Algebra Assignment #4',
    description: 'Solve questions 1 through 15 on Matrix diagonalisation',
    dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    priority: 'High',
    status: 'In Progress',
    estimatedTime: 60
  });

  await DB.Task.create({
    userId,
    subjectId: physics._id,
    title: 'Mechanics Lab Report Submission',
    description: 'Verify oscillator experiment calculations and format PDF',
    dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    priority: 'High',
    status: 'Todo',
    estimatedTime: 90
  });

  await DB.Task.create({
    userId,
    subjectId: cs._id,
    title: 'Implement Binary Search Tree in TypeScript',
    description: 'Write insert, delete, and breadth-first search traversals',
    dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    priority: 'Medium',
    status: 'Completed',
    estimatedTime: 75
  });

  await DB.Task.create({
    userId,
    subjectId: english._id,
    title: 'Technical Presentation Slide Deck',
    description: 'Draft 8 slides on Cloud Computing for seminar presentation',
    dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    priority: 'Low',
    status: 'Todo',
    estimatedTime: 45
  });

  await DB.Task.create({
    userId,
    subjectId: math._id,
    title: 'Review Calculus Previous Year Questions',
    description: 'Solve 2024 and 2025 question papers for semester end evaluation',
    dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
    priority: 'High',
    status: 'Todo',
    estimatedTime: 120
  });

  // 5. Today's Study Sessions (Matches prompt Section 9 example)
  const todayStr = now.toISOString().split('T')[0];

  await DB.StudySession.create({
    userId,
    subjectId: math._id,
    topicId: tMath1._id,
    title: 'Algebra: Linear Transformations',
    date: new Date(todayStr),
    startTime: '08:00 AM',
    endTime: '09:00 AM',
    duration: 60,
    type: 'Study',
    priority: 'High',
    completed: true
  });

  await DB.StudySession.create({
    userId,
    subjectId: physics._id,
    topicId: tPhy1._id,
    title: 'Mechanics: Rotational Motion',
    date: new Date(todayStr),
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    duration: 90,
    type: 'Practice',
    priority: 'High',
    completed: true
  });

  await DB.StudySession.create({
    userId,
    subjectId: cs._id,
    topicId: tCs1._id,
    title: 'Computer Science: Async JS & Event Loop',
    date: new Date(todayStr),
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    duration: 60,
    type: 'Study',
    priority: 'Medium',
    completed: false
  });

  await DB.StudySession.create({
    userId,
    subjectId: english._id,
    topicId: tEng1._id,
    title: 'English: Communication Skills & Body Language',
    date: new Date(todayStr),
    startTime: '05:00 PM',
    endTime: '05:45 PM',
    duration: 45,
    type: 'Revision',
    priority: 'Low',
    completed: false
  });

  // 6. Pomodoro Sessions for analytics
  for (let i = 0; i < 8; i++) {
    const pDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    await DB.Pomodoro.create({
      userId,
      duration: 25,
      date: pDate,
      completed: true
    });
    if (i % 2 === 0) {
      await DB.Pomodoro.create({
        userId,
        duration: 25,
        date: pDate,
        completed: true
      });
    }
  }

  console.log('✅ Demo data successfully seeded for Sagar (sagar@college.edu / password123)');
  return user;
}
