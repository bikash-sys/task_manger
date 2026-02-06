
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Task } from '../types';
import Modal from './Modal';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import PlusIcon from './icons/PlusIcon';
import ConfirmationDialog from './ConfirmationDialog';

const PriorityBadge: React.FC<{ priority: 'low' | 'medium' | 'high' }> = ({ priority }) => {
    const colors = {
        low: 'border-blue-500 text-blue-400',
        medium: 'border-yellow-500 text-yellow-400',
        high: 'border-red-500 text-red-400',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${colors[priority]}`}>{priority}</span>;
};

const TaskForm: React.FC<{ task?: Task | null; onSave: (task: Omit<Task, 'id' | 'completed'> & { id?: string }) => void; onCancel: () => void; }> = ({ task, onSave, onCancel }) => {
    const [text, setText] = useState(task?.text || '');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');
    const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split('T')[0] : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text) return;
        onSave({ id: task?.id, text, priority, dueDate: dueDate || undefined });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="task-text" className="block text-sm font-medium text-on-surface-secondary mb-1">Task</label>
                <input id="task-text" type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" placeholder="e.g., Finish project proposal" required />
            </div>
            <div>
                <label htmlFor="task-priority" className="block text-sm font-medium text-on-surface-secondary mb-1">Priority</label>
                <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div>
                <label htmlFor="task-duedate" className="block text-sm font-medium text-on-surface-secondary mb-1">Due Date</label>
                <input id="task-duedate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-focus transition-colors">Save Task</button>
            </div>
        </form>
    );
}


const Tasks: React.FC = () => {
  const { data, setData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const handleOpenModal = (task: Task | null = null) => {
      setEditingTask(task);
      setIsModalOpen(true);
  }
  
  const handleCloseModal = () => {
      setEditingTask(null);
      setIsModalOpen(false);
  }

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed'> & { id?: string }) => {
      if (taskData.id) { // Editing existing task
          const updatedTasks = data.tasks.map(t => t.id === taskData.id ? { ...t, ...taskData } : t);
          setData({ ...data, tasks: updatedTasks });
      } else { // Adding new task
          const newTask: Task = {
              id: Date.now().toString(),
              completed: false,
              ...taskData
          };
          setData({ ...data, tasks: [newTask, ...data.tasks] });
      }
      handleCloseModal();
  }

  const toggleTask = (id: string) => {
    const updatedTasks = data.tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setData({ ...data, tasks: updatedTasks });
  };
  
  const deleteTask = (id: string) => {
    setConfirmingDelete(id);
  };

  const handleConfirmDelete = () => {
      if (confirmingDelete) {
          const updatedTasks = data.tasks.filter(task => task.id !== confirmingDelete);
          setData({ ...data, tasks: updatedTasks });
          setConfirmingDelete(null);
      }
  };

  const taskToDelete = confirmingDelete ? data.tasks.find(t => t.id === confirmingDelete) : null;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Tasks</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Task
        </button>
      </div>
      <div className="bg-surface p-6 rounded-lg shadow-lg">
        <ul className="space-y-4">
          {data.tasks.map(task => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-4 p-4 bg-gray-700/50 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="h-5 w-5 rounded bg-gray-800 border-gray-600 text-primary focus:ring-primary flex-shrink-0"
                />
                <div className="ml-4 min-w-0">
                    <span className={`text-lg break-words ${task.completed ? 'line-through text-on-surface-secondary' : 'text-white'}`}>
                        {task.text}
                    </span>
                    {task.dueDate && <p className="text-xs text-accent">{new Date(task.dueDate).toLocaleDateString()}</p>}
                </div>
              </div>
              <div className="flex items-center space-x-4 flex-shrink-0">
                <PriorityBadge priority={task.priority} />
                <button onClick={() => handleOpenModal(task)} className="text-gray-500 hover:text-white">
                    <PencilIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500">
                    <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            </li>
          ))}
           {data.tasks.length === 0 && <p className="text-on-surface-secondary text-center">No tasks yet. Add one with your voice or the 'Add Task' button!</p>}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? 'Edit Task' : 'Add New Task'}>
          <TaskForm task={editingTask} onSave={handleSaveTask} onCancel={handleCloseModal} />
      </Modal>
      <ConfirmationDialog
        isOpen={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
      >
        Are you sure you want to delete the task "{taskToDelete?.text}"? This action cannot be undone.
      </ConfirmationDialog>
    </div>
  );
};

export default Tasks;
