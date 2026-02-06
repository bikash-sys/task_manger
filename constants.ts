import { AppData, KnowledgeStatus } from './types';
import DashboardIcon from './components/icons/DashboardIcon';
import TasksIcon from './components/icons/TasksIcon';
import GoalsIcon from './components/icons/GoalsIcon';
import SyllabusIcon from './components/icons/SyllabusIcon';
import ExamsIcon from './components/icons/ExamsIcon';
import TimeTableIcon from './components/icons/TimeTableIcon';

export enum AppView {
  Dashboard = 'Dashboard',
  Tasks = 'Tasks',
  Goals = 'Goals',
  Syllabus = 'Syllabus',
  Exams = 'Exams',
  TimeTable = 'TimeTable',
}

export const NAV_ITEMS = [
  { name: 'Dashboard', view: AppView.Dashboard, icon: DashboardIcon },
  { name: 'Tasks', view: AppView.Tasks, icon: TasksIcon },
  { name: 'Goals', view: AppView.Goals, icon: GoalsIcon },
  { name: 'Syllabus', view: AppView.Syllabus, icon: SyllabusIcon },
  { name: 'Exams', view: AppView.Exams, icon: ExamsIcon },
  { name: 'Time Table', view: AppView.TimeTable, icon: TimeTableIcon },
];

export const INITIAL_APP_DATA: AppData = {
  tasks: [
    { id: '1', text: 'Finish project proposal', completed: false, priority: 'high', dueDate: new Date().toISOString() },
    { id: '2', text: 'Buy groceries', completed: true, priority: 'medium' },
    { id: '3', text: 'Call the dentist', completed: false, priority: 'low' },
  ],
  goals: [
    { id: '1', name: 'Read 50 books this year', target: 50, current: 15, unit: 'books' },
    { id: '2', name: 'Exercise 3 times a week', target: 3, current: 2, unit: 'times' },
    { id: '3', name: 'Read 1000 pages this month', target: 1000, current: 250, unit: 'pages' },
  ],
  syllabus: [
    {
      id: 'subj-1',
      name: 'History',
      chapters: [
        { id: 'hist-1', name: 'Chapter 1: Ancient Civilizations', progress: 80, status: KnowledgeStatus.InProgress },
        { id: 'hist-2', name: 'Chapter 2: The Middle Ages', progress: 20, status: KnowledgeStatus.Noob },
      ],
    },
    {
        id: 'subj-2',
        name: 'Mathematics',
        chapters: [
            { id: 'math-1', name: 'Chapter 1: Algebra', progress: 100, status: KnowledgeStatus.Mastered },
            { id: 'math-2', name: 'Chapter 2: Calculus', progress: 50, status: KnowledgeStatus.InProgress },
        ]
    }
  ],
  exams: [
    { id: 'exam-1', subjectId: 'subj-2', title: 'Calculus Midterm', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
  ],
  timeTable: [
    { id: 'tt-1', startTime: '09:00', endTime: '12:00', title: 'Work', status: 'Busy' },
    { id: 'tt-2', startTime: '12:00', endTime: '13:00', title: 'Lunch Break', status: 'Free' },
    { id: 'tt-3', startTime: '18:00', endTime: '19:00', title: 'Gym', status: 'Busy' },
  ],
};