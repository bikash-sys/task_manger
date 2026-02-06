
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { TimeBlock } from '../types';
import Modal from './Modal';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationDialog from './ConfirmationDialog';

const TimeBlockForm: React.FC<{
  block?: TimeBlock | null;
  onSave: (block: Omit<TimeBlock, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}> = ({ block, onSave, onCancel }) => {
    const [title, setTitle] = useState(block?.title || '');
    const [startTime, setStartTime] = useState(block?.startTime || '09:00');
    const [endTime, setEndTime] = useState(block?.endTime || '10:00');
    const [status, setStatus] = useState<'Busy' | 'Free'>(block?.status || 'Busy');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startTime || !endTime) return;
        onSave({ id: block?.id, title, startTime, endTime, status });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="tb-title" className="block text-sm font-medium text-on-surface-secondary mb-1">Title</label>
                <input id="tb-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="tb-start" className="block text-sm font-medium text-on-surface-secondary mb-1">Start Time</label>
                    <input id="tb-start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
                </div>
                 <div>
                    <label htmlFor="tb-end" className="block text-sm font-medium text-on-surface-secondary mb-1">End Time</label>
                    <input id="tb-end" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
                </div>
            </div>
             <div>
                <label htmlFor="tb-status" className="block text-sm font-medium text-on-surface-secondary mb-1">Status</label>
                <select id="tb-status" value={status} onChange={e => setStatus(e.target.value as 'Busy' | 'Free')} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary">
                    <option value="Busy">Busy</option>
                    <option value="Free">Free</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-focus">Save Event</button>
            </div>
        </form>
    );
}

const TimeTable: React.FC = () => {
  const { data, setData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const sortedTimeTable = [...data.timeTable].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleOpenModal = (block: TimeBlock | null = null) => {
    setEditingBlock(block);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setEditingBlock(null);
    setIsModalOpen(false);
  }

  const handleSaveBlock = (blockData: Omit<TimeBlock, 'id'> & { id?: string }) => {
    if (blockData.id) {
        const updatedTimeTable = data.timeTable.map(b => b.id === blockData.id ? { ...b, ...blockData } : b);
        setData({ ...data, timeTable: updatedTimeTable });
    } else {
        const newBlock: TimeBlock = { id: Date.now().toString(), ...blockData };
        setData({ ...data, timeTable: [...data.timeTable, newBlock] });
    }
    handleCloseModal();
  }

  const handleDeleteBlock = (id: string) => {
    setConfirmingDelete(id);
  }

  const handleConfirmDelete = () => {
      if (confirmingDelete) {
          setData({ ...data, timeTable: data.timeTable.filter(b => b.id !== confirmingDelete) });
          setConfirmingDelete(null);
      }
  }

  const blockToDelete = confirmingDelete ? data.timeTable.find(b => b.id === confirmingDelete) : null;

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Time Table</h1>
             <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                <PlusIcon className="w-5 h-5 mr-2" /> Add Event
            </button>
       </div>
      <div className="bg-surface p-6 rounded-lg shadow-lg">
        <ul className="space-y-3">
          {sortedTimeTable.map(block => (
            <li key={block.id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-4 flex-grow min-w-[200px]">
                        <div className="w-24 text-right font-mono text-accent flex-shrink-0">
                            {block.startTime} - {block.endTime}
                        </div>
                        <div className={`w-1 h-10 rounded-full ${block.status === 'Busy' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <p className="text-md sm:text-lg font-semibold text-white break-words">{block.title}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                          block.status === 'Busy' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {block.status}
                        </span>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handleOpenModal(block)} className="text-gray-400 hover:text-white"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDeleteBlock(block.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
            </li>
          ))}
          {data.timeTable.length === 0 && (
            <p className="text-on-surface-secondary text-center py-8">Your time table is empty.</p>
          )}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBlock ? 'Edit Event' : 'Add New Event'}>
        <TimeBlockForm 
            block={editingBlock} 
            onSave={handleSaveBlock}
            onCancel={handleCloseModal}
        />
      </Modal>
      <ConfirmationDialog
        isOpen={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
      >
        Are you sure you want to delete the event "{blockToDelete?.title}" from your time table?
      </ConfirmationDialog>
    </div>
  );
};

export default TimeTable;
