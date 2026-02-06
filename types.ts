
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  attachments?: string[];
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string; // e.g., 'pages', 'hours', 'times'
}

export enum KnowledgeStatus {
    Noob = 'Noob',
    InProgress = 'In Progress',
    Mastered = 'Mastered'
}

export interface Chapter {
    id: string;
    name: string;
    progress: number; // 0-100
    status: KnowledgeStatus;
}

export interface Subject {
    id: string;
    name: string;
    chapters: Chapter[];
}

export interface Exam {
    id: string;
    subjectId: string;
    title: string;
    date: string; // ISO string
}

export interface TimeBlock {
    id: string;
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    title: string;
    status: 'Busy' | 'Free';
}

export interface AppData {
    tasks: Task[];
    goals: Goal[];
    syllabus: Subject[];
    exams: Exam[];
    timeTable: TimeBlock[];
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
