
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Exam } from '../types';
import Modal from './Modal';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationDialog from './ConfirmationDialog';

const ExamForm: React.FC<{
  exam?: Exam | null;
  subjects: { id: string, name: string }[];
  onSave: (exam: Omit<Exam, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}> = ({ exam, subjects, onSave, onCancel }) => {
    const [title, setTitle] = useState(exam?.title || '');
    const [subjectId, setSubjectId] = useState(exam?.subjectId || (subjects[0]?.id || ''));
    const [date, setDate] = useState(exam?.date ? exam.date.split('T')[0] : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !subjectId || !date) return;
        onSave({ id: exam?.id, title, subjectId, date: new Date(date).toISOString() });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="exam-title" className="block text-sm font-medium text-on-surface-secondary mb-1">Exam Title</label>
                <input id="exam-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
            </div>
            <div>
                <label htmlFor="exam-subject" className="block text-sm font-medium text-on-surface-secondary mb-1">Subject</label>
                <select id="exam-subject" value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                 {subjects.length === 0 && <p className="text-xs text-yellow-400 mt-1">No subjects found. Please add a subject in the Syllabus section first.</p>}
            </div>
            <div>
                <label htmlFor="exam-date" className="block text-sm font-medium text-on-surface-secondary mb-1">Date</label>
                <input id="exam-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" disabled={subjects.length === 0} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-focus disabled:bg-gray-500 disabled:cursor-not-allowed">Save Exam</button>
            </div>
        </form>
    );
}


const Exams: React.FC = () => {
  const { data, setData } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  const sortedExams = [...data.exams].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleOpenModal = (exam: Exam | null = null) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setEditingExam(null);
    setIsModalOpen(false);
  }

  const handleSaveExam = (examData: Omit<Exam, 'id'> & { id?: string }) => {
    if (examData.id) {
        const updatedExams = data.exams.map(e => e.id === examData.id ? { ...e, ...examData } : e);
        setData({ ...data, exams: updatedExams });
    } else {
        const newExam: Exam = { id: Date.now().toString(), ...examData };
        setData({ ...data, exams: [...data.exams, newExam] });
    }
    handleCloseModal();
  }

  const handleDeleteExam = (id: string) => {
    setConfirmingDelete(id);
  }

  const handleConfirmDelete = () => {
      if (confirmingDelete) {
          setData({ ...data, exams: data.exams.filter(e => e.id !== confirmingDelete) });
          setConfirmingDelete(null);
      }
  }

  const examToDelete = confirmingDelete ? data.exams.find(e => e.id === confirmingDelete) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Exams</h1>
        <button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
            <PlusIcon className="w-5 h-5 mr-2" /> Add Exam
        </button>
      </div>
      <div className="bg-surface p-6 rounded-lg shadow-lg">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedExams.map(exam => {
                const subject = data.syllabus.find(s => s.id === exam.subjectId);
                const examDate = new Date(exam.date);
                const daysLeft = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                    <div key={exam.id} className="bg-gray-700/50 p-5 rounded-lg border border-gray-600 flex flex-col justify-between group">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white pr-2">{exam.title}</h3>
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(exam)} className="p-1 text-gray-400 hover:text-white"><PencilIcon className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteExam(exam.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <p className="text-primary font-semibold">{subject?.name || 'Unknown Subject'}</p>
                            <p className="text-on-surface-secondary mt-2">{examDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="mt-4 text-right">
                           {daysLeft > 0 ? (
                               <span className="text-accent font-bold text-lg">{daysLeft} day{daysLeft > 1 ? 's' : ''} left</span>
                           ) : daysLeft === 0 ? (
                               <span className="text-green-400 font-bold text-lg">Today</span>
                           ) : (
                               <span className="text-red-500 font-bold text-lg">Past</span>
                           )}
                        </div>
                    </div>
                );
            })}
             {data.exams.length === 0 && (
                <p className="text-on-surface-secondary col-span-full text-center py-8">No exams scheduled.</p>
             )}
         </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingExam ? 'Edit Exam' : 'Add New Exam'}>
        <ExamForm 
            exam={editingExam} 
            subjects={data.syllabus.map(s => ({id: s.id, name: s.name}))}
            onSave={handleSaveExam}
            onCancel={handleCloseModal}
        />
      </Modal>
      <ConfirmationDialog
        isOpen={!!confirmingDelete}
        onClose={() => setConfirmingDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Exam"
      >
        Are you sure you want to delete the "{examToDelete?.title}" exam?
      </ConfirmationDialog>
    </div>
  );
};

export default Exams;
