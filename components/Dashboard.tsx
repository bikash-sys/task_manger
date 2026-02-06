
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Task, Goal, Exam, TimeBlock } from '../types';

const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' }> = ({ priority }) => {
    const color = {
        low: 'bg-blue-500',
        medium: 'bg-yellow-500',
        high: 'bg-red-500',
    }[priority];
    return <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${color}`}>{priority}</span>;
};


const Dashboard: React.FC = () => {
  const { data } = useAppContext();
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingTasks = data.tasks.filter(t => !t.completed && t.dueDate && t.dueDate.startsWith(today)).slice(0, 3);
  const overdueTasks = data.tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;
  const upcomingExams = data.exams.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 2);
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <div className="bg-surface p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Today's Schedule</h2>
          <ul className="space-y-3">
             {data.timeTable.sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 4).map(block => (
                 <li key={block.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                    <div>
                        <p className="font-medium text-white">{block.title}</p>
                        <p className="text-sm text-on-surface-secondary">{block.startTime} - {block.endTime}</p>
                    </div>
                    <span className={`text-xs font-bold ${block.status === 'Busy' ? 'text-red-400' : 'text-green-400'}`}>{block.status}</span>
                 </li>
             ))}
             {data.timeTable.length === 0 && <p className="text-on-surface-secondary">No schedule set for today.</p>}
          </ul>
        </div>

        {/* High Priority Tasks */}
        <div className="bg-surface p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Priority Tasks</h2>
           <ul className="space-y-3">
             {upcomingTasks.map(task => (
                 <li key={task.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                    <p className="text-white">{task.text}</p>
                    <PriorityBadge priority={task.priority} />
                 </li>
             ))}
             {upcomingTasks.length === 0 && <p className="text-on-surface-secondary">No high priority tasks for today.</p>}
             {overdueTasks > 0 && <p className="text-red-400 mt-4">{overdueTasks} task(s) overdue.</p>}
          </ul>
        </div>
        
        {/* Upcoming Exams */}
        <div className="bg-surface p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming Exams</h2>
           <ul className="space-y-3">
            {upcomingExams.map(exam => {
                const subject = data.syllabus.find(s => s.id === exam.subjectId);
                return (
                    <li key={exam.id} className="p-2 bg-gray-700/50 rounded">
                        <p className="font-medium text-white">{exam.title}</p>
                        <p className="text-sm text-on-surface-secondary">{subject?.name}</p>
                        <p className="text-sm text-accent font-semibold mt-1">{new Date(exam.date).toLocaleDateString()}</p>
                    </li>
                );
            })}
             {upcomingExams.length === 0 && <p className="text-on-surface-secondary">No upcoming exams.</p>}
           </ul>
        </div>
        
        {/* Goal Progress */}
        <div className="bg-surface p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold text-white mb-4">Goal Progress</h2>
            <div className="space-y-4">
            {data.goals.map(goal => {
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                return (
                    <div key={goal.id}>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-white">{goal.name}</span>
                            <span className="text-sm font-medium text-on-surface-secondary">{goal.current} / {goal.target} {goal.unit}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                );
            })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
