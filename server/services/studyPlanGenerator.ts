export interface StudyPlanOptions {
  userId: string;
  subjects: Array<{
    _id: string;
    name: string;
    difficulty: string;
    priority: string;
    color: string;
  }>;
  topics: Array<{
    _id: string;
    subjectId: string;
    name: string;
    completed: boolean;
    difficulty: string;
  }>;
  examDate?: string | Date;
  availableHoursPerDay: number; // e.g. 4
  weakSubjectIds: string[];
  preferredStudyTime: string; // Morning, Afternoon, Evening, Night
  studyDays: string[]; // e.g. ['Monday', 'Tuesday', ...]
  dailyGoalHours: number;
  planDurationDays?: number; // default to 7 or days until exam
}

export interface GeneratedPlanSession {
  userId: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topicId?: string;
  topicName?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "08:00 AM"
  endTime: string;   // e.g. "09:00 AM"
  duration: number;  // in minutes
  type: 'Study' | 'Revision' | 'Practice' | 'Mock Test' | 'Break';
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
}

export function generateSmartStudyPlan(options: StudyPlanOptions): GeneratedPlanSession[] {
  const {
    userId,
    subjects,
    topics,
    examDate,
    availableHoursPerDay = 4,
    weakSubjectIds = [],
    preferredStudyTime = 'Morning',
    studyDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    planDurationDays = 7
  } = options;

  if (!subjects || subjects.length === 0) {
    return [];
  }

  // Calculate days count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetDays = planDurationDays;
  if (examDate) {
    const examD = new Date(examDate);
    examD.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((examD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      targetDays = Math.min(diffDays, 14); // up to 14 days generated in batch
    }
  }

  // Compute weight score for each subject based on:
  // - Weak subject flag (1.5x)
  // - Difficulty: Hard=3, Medium=2, Easy=1
  // - Priority: High=3, Medium=2, Low=1
  // - Incomplete topics ratio
  const subjectWeights = subjects.map(sub => {
    let score = 1;
    if (sub.difficulty === 'Hard') score += 3;
    else if (sub.difficulty === 'Medium') score += 2;
    else score += 1;

    if (sub.priority === 'High') score += 3;
    else if (sub.priority === 'Medium') score += 2;
    else score += 1;

    if (weakSubjectIds.includes(sub._id)) {
      score += 3; // high boost for student's declared weak areas
    }

    const subTopics = topics.filter(t => t.subjectId === sub._id);
    const incompleteCount = subTopics.filter(t => !t.completed).length;
    score += incompleteCount * 0.5;

    return {
      subject: sub,
      weight: score,
      subTopics,
      uncompletedTopics: subTopics.filter(t => !t.completed),
      completedTopics: subTopics.filter(t => t.completed)
    };
  });

  // Sort subjects by priority weight descending
  subjectWeights.sort((a, b) => b.weight - a.weight);

  // Time slot presets based on preferred study time
  let startHour = 8; // 8 AM
  if (preferredStudyTime === 'Afternoon') startHour = 13; // 1 PM
  else if (preferredStudyTime === 'Evening') startHour = 17; // 5 PM
  else if (preferredStudyTime === 'Night') startHour = 20; // 8 PM

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const generatedSessions: GeneratedPlanSession[] = [];

  let globalSubjectIndex = 0;

  for (let dayOffset = 0; dayOffset < targetDays; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + dayOffset);
    const dayOfWeek = dayNames[currentDate.getDay()];

    // Check if user studies on this day
    if (!studyDays.includes(dayOfWeek)) {
      continue;
    }

    const dateStr = currentDate.toISOString().split('T')[0];

    // Total daily minutes budgeted
    const totalDailyMinutes = Math.min(availableHoursPerDay, 8) * 60;
    let scheduledMinutes = 0;

    let currentHour = startHour;
    let currentMinute = 0;

    // We alternate session types:
    // Session 1: New Study (Deep focus)
    // Short Break (15 min)
    // Session 2: Practice or Revision
    // Short Break (15 min)
    // Session 3: Practice or Mock Test (on alternate days)
    let sessionCountForDay = 0;

    while (scheduledMinutes < totalDailyMinutes) {
      const remainingMinutes = totalDailyMinutes - scheduledMinutes;
      if (remainingMinutes < 30) break; // done for the day

      // Pick subject: favor higher weight, rotate smoothly
      const subObj = subjectWeights[globalSubjectIndex % subjectWeights.length];
      globalSubjectIndex++;

      // Session duration: between 45 and 90 mins
      let sessionDuration = 60;
      if (remainingMinutes <= 60) {
        sessionDuration = remainingMinutes;
      } else if (subObj.subject.difficulty === 'Hard' && remainingMinutes >= 90) {
        sessionDuration = 90;
      } else {
        sessionDuration = 60;
      }

      // Determine activity type
      let type: 'Study' | 'Revision' | 'Practice' | 'Mock Test' = 'Study';
      let title = '';
      let topic = subObj.uncompletedTopics.shift(); // take first incomplete topic

      if (sessionCountForDay === 0) {
        type = 'Study';
        title = topic ? `${topic.name} - Concept Mastery` : `${subObj.subject.name} - Deep Dive`;
      } else if (sessionCountForDay === 1) {
        type = 'Practice';
        title = topic ? `${topic.name} - Problem Solving` : `${subObj.subject.name} - Practice Questions`;
      } else if (sessionCountForDay === 2 && dayOffset % 2 === 1) {
        type = 'Mock Test';
        title = `${subObj.subject.name} - Mock Quiz & Self Evaluation`;
      } else {
        type = 'Revision';
        // Pick an already completed topic to reinforce spaced repetition
        const revTopic = subObj.completedTopics[Math.floor(Math.random() * (subObj.completedTopics.length || 1))];
        title = revTopic ? `${revTopic.name} - Spaced Revision` : `${subObj.subject.name} - Core Summary`;
      }

      // Format start and end time
      const startTimeStr = formatTime(currentHour, currentMinute);
      const endTotalMinutes = currentHour * 60 + currentMinute + sessionDuration;
      const endHour = Math.floor(endTotalMinutes / 60);
      const endMinute = endTotalMinutes % 60;
      const endTimeStr = formatTime(endHour, endMinute);

      generatedSessions.push({
        userId,
        subjectId: subObj.subject._id,
        subjectName: subObj.subject.name,
        subjectColor: subObj.subject.color,
        topicId: topic ? topic._id : undefined,
        topicName: topic ? topic.name : undefined,
        title,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: sessionDuration,
        type,
        priority: (subObj.subject.priority as any) || 'High',
        completed: false
      });

      scheduledMinutes += sessionDuration;
      currentHour = endHour;
      currentMinute = endMinute;
      sessionCountForDay++;

      // Insert smart restorative Break if there is more study time remaining
      if (scheduledMinutes < totalDailyMinutes && totalDailyMinutes - scheduledMinutes >= 45) {
        const breakDuration = 15;
        const breakEndMinutes = currentHour * 60 + currentMinute + breakDuration;
        const breakEndHour = Math.floor(breakEndMinutes / 60);
        const breakEndMin = breakEndMinutes % 60;

        generatedSessions.push({
          userId,
          subjectId: subObj.subject._id,
          subjectName: 'Rest & Recharge',
          subjectColor: '#10b981',
          title: 'Hydration & Mind Relaxation',
          date: dateStr,
          startTime: formatTime(currentHour, currentMinute),
          endTime: formatTime(breakEndHour, breakEndMin),
          duration: breakDuration,
          type: 'Break',
          priority: 'Low',
          completed: false
        });

        currentHour = breakEndHour;
        currentMinute = breakEndMin;
        scheduledMinutes += breakDuration;
      }
    }
  }

  return generatedSessions;
}

function formatTime(hour24: number, minutes: number): string {
  const normHour = hour24 % 24;
  const period = normHour >= 12 ? 'PM' : 'AM';
  let hour12 = normHour % 12;
  if (hour12 === 0) hour12 = 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const hrStr = hour12 < 10 ? `0${hour12}` : `${hour12}`;
  return `${hrStr}:${minStr} ${period}`;
}
