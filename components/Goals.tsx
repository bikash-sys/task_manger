
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Goal } from '../types';
import Modal from './Modal';
import TrashIcon from './icons/TrashIcon';
import PencilIcon from './icons/PencilIcon';
import PlusIcon from './icons/PlusIcon';
import ConfirmationDialog from './ConfirmationDialog';


const GoalForm: React.FC<{ goal?: Goal | null; onSave: (goal: Omit<Goal, 'id'> & { id?: string }) => void; onCancel: () => void; }> = ({ goal, onSave, onCancel }) => {
    const [name, setName] = useState(goal?.name || '');
    const [target, setTarget] = useState(goal?.target || 100);
    const [current, setCurrent] = useState(goal?.current || 0);
    const [unit, setUnit] = useState(goal?.unit || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !target || !unit) return;
        onSave({ id: goal?.id, name, target, current, unit });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="goal-name" className="block text-sm font-medium text-on-surface-secondary mb-1">Goal Name</label>
                <input id="goal-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" placeholder="e.g., Read 50 books" required />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="goal-current" className="block text-sm font-medium text-on-surface-secondary mb-1">Current Progress</label>
                    <input id="goal-current" type="number" value={current} onChange={(e) => setCurrent(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                    <label htmlFor="goal-target" className="block text-sm font-medium text-on-surface-secondary mb-1">Target</label>
                    <input id="goal-target" type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} min="1" className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
                </div>
            </div>
             <div>
                <label htmlFor="goal-unit" className="block text-sm font-medium text-on-surface-secondary mb-1">Unit</label>
                <input id="goal-unit" type="text" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" placeholder="e.g., books, hours" required />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-focus transition-colors">Save Goal</button>
            </div>
        </form>
    );
}

const Goals: React.FC = () => {
  const { data, setData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const chartData = data.goals.map(goal => ({
      name: goal.name,
      progress: Math.min((goal.current / goal.target) * 100, 100),
      current: goal.current,
      target: goal.target,
      unit: goal.unit
  }));

  const handleOpenModal = (goal: Goal | null = null) => {
      setEditingGoal(goal);
      setIsModalOpen(true);
  }
  
  const handleCloseModal = () => {
      setEditingGoal(null);
      setIsModalOpen(false);
  }

  const handleSaveGoal = (goalData: Omit<Goal, 'id'> & { id?: string }) => {
      if (goalData.id) {
          const updatedGoals = data.goals.map(g => g.id === goalData.id ? { ...g, ...goalData } : g);
          setData({ ...data, goals: updatedGoals });
      } else {
          const newGoal: Goal = { id: Date.now().toString(), ...goalData };
          setData({ ...data, goals: [...data.goals, newGoal] });
      }
      handleCloseModal();
  }

  const handleDeleteGoal = (id: string) => {
    setConfirmingDelete(id);
  }
  
  const handleConfirmDelete = () => {
    if (confirmingDelete) {
        setData({ ...data, goals: data.goals.filter(g => g.id !== confirmingDelete) });
        setConfirmingDelete(null);
    }
  }

  const updateGoalProgress = (id: string, newCurrent: number) => {
      const updatedGoals = data.goals.map(g => {
          if (g.id === id) {
              return { ...g, current: Math.max(0, newCurrent) }; // Prevent negative progress
          }
          return g;
      });
      setData({ ...data, goals: updatedGoals });
  }

  const goalToDelete = confirmingDelete ? data.goals.find(g => g.id === confirmingDelete) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Goals</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Goal
        </button>
      </div>
      
      <div className="bg-surface p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Progress Overview</h2>
        {data.goals.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF' }} stroke="#4B5563" unit="%"/>
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80} 
                      tick={{ fill: '#D1D5DB', fontSize: 12 }} 
                      stroke="#4B5563" 
                      tickFormatter={(value) => typeof value === 'string' && value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                        labelStyle={{ color: '#F9FAFB' }}
                        formatter={(value, name, props) => [`${props.payload.current} / ${props.payload.target} ${props.payload.unit}`, 'Progress']}
                        />
                    <Bar dataKey="progress" barSize={20} radius={[0, 10, 10, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.progress >= 100 ? '#4ADE80' : '#22C55E'}/>
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        ) : (
             <p className="text-on-surface-secondary text-center py-8">No goals yet. Add one to get started!</p>
        )}
      </div>

      <div className="bg-surface p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Manage Goals</h2>
        <div className="space-y-4">
            {data.goals.map(goal => {
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                return (
                    <div key={goal.id} className="bg-gray-700/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-medium text-white">{goal.name}</h3>
                                <span className="text-sm font-medium text-on-surface-secondary">{goal.current} / {goal.target} {goal.unit}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleOpenModal(goal)} className="p-2 text-gray-400 hover:text-white"><PencilIcon className="w-5 h-5" /></button>
                                <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                         <div className="mt-3">
                            <div className="w-full bg-gray-600 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                         </div>
                        <div className="flex items-center justify-end space-x-2 mt-2">
                            <button onClick={() => updateGoalProgress(goal.id, goal.current - 1)} className="px-2 py-0.5 bg-gray-600 rounded">-</button>
                            <input 
                                type="number" 
                                value={goal.current} 
                                onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))} 
                                className="w-20 text-center bg-gray-800 border border-gray-600 rounded-md py-1 text-white"
                            />
                            <button onClick={() => updateGoalProgress(goal.id, goal.current + 1)} className="px-2 py-0.5 bg-gray-600 rounded">+</button>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingGoal ? 'Edit Goal' : 'Add New Goal'}>
          <GoalForm goal={editingGoal} onSave={handleSaveGoal} onCancel={handleCloseModal} />
      </Modal>
      <ConfirmationDialog
        isOpen={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
      >
        Are you sure you want to delete the goal "{goalToDelete?.name}"? This action cannot be undone.
      </ConfirmationDialog>
    </div>
  );
};

export default Goals;
