
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Subject, Chapter, KnowledgeStatus } from '../types';
import Modal from './Modal';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import ConfirmationDialog from './ConfirmationDialog';

const SubjectForm: React.FC<{ subject?: Subject | null; onSave: (name: string) => void; onCancel: () => void; }> = ({ subject, onSave, onCancel }) => {
    const [name, setName] = useState(subject?.name || '');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name) return;
        onSave(name);
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label htmlFor="subject-name" className="block text-sm font-medium text-on-surface-secondary mb-1">Subject Name</label>
                <input id="subject-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-focus">Save Subject</button>
            </div>
        </form>
    );
}

const ChapterForm: React.FC<{ chapter?: Chapter | null; onSave: (chapter: Omit<Chapter, 'id'> & { id?: string }) => void; onCancel: () => void; }> = ({ chapter, onSave, onCancel }) => {
    const [name, setName] = useState(chapter?.name || '');
    const [progress, setProgress] = useState(chapter?.progress || 0);
    const [status, setStatus] = useState<KnowledgeStatus>(chapter?.status || KnowledgeStatus.Noob);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onSave({ id: chapter?.id, name, progress, status });
    }

    return (
         <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label htmlFor="chapter-name" className="block text-sm font-medium text-on-surface-secondary mb-1">Chapter Name</label>
                <input id="chapter-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary" required />
            </div>
            <div>
                <label htmlFor="chapter-progress" className="block text-sm font-medium text-on-surface-secondary mb-1">Progress: {progress}%</label>
                <input id="chapter-progress" type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
                <label htmlFor="chapter-status" className="block text-sm font-medium text-on-surface-secondary mb-1">Status</label>
                <select id="chapter-status" value={status} onChange={(e) => setStatus(e.target.value as KnowledgeStatus)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-primary focus:border-primary">
                    {Object.values(KnowledgeStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-focus">Save Chapter</button>
            </div>
         </form>
    )
}

const Syllabus: React.FC = () => {
  const { data, setData } = useAppContext();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(data.syllabus[0] || null);
  
  // Modal states
  const [subjectModal, setSubjectModal] = useState<{isOpen: boolean, subject: Subject | null}>({isOpen: false, subject: null});
  const [chapterModal, setChapterModal] = useState<{isOpen: boolean, chapter: Chapter | null}>({isOpen: false, chapter: null});
  const [confirmingDeleteSubject, setConfirmingDeleteSubject] = useState<string | null>(null);
  const [confirmingDeleteChapter, setConfirmingDeleteChapter] = useState<string | null>(null);

  const handleSaveSubject = (name: string) => {
      let updatedSyllabus;
      if (subjectModal.subject) { // Editing
          updatedSyllabus = data.syllabus.map(s => s.id === subjectModal.subject!.id ? { ...s, name } : s);
          setSelectedSubject(updatedSyllabus.find(s => s.id === subjectModal.subject!.id) || null);
      } else { // Adding
          const newSubject: Subject = { id: Date.now().toString(), name, chapters: [] };
          updatedSyllabus = [...data.syllabus, newSubject];
          setSelectedSubject(newSubject);
      }
      setData({ ...data, syllabus: updatedSyllabus });
      setSubjectModal({isOpen: false, subject: null});
  }

  const handleDeleteSubject = (id: string) => {
      setConfirmingDeleteSubject(id);
  }

  const handleConfirmDeleteSubject = () => {
      if (confirmingDeleteSubject) {
          const updatedSyllabus = data.syllabus.filter(s => s.id !== confirmingDeleteSubject);
          setData({ ...data, syllabus: updatedSyllabus, exams: data.exams.filter(e => e.subjectId !== confirmingDeleteSubject) }); // Also remove related exams
          if (selectedSubject?.id === confirmingDeleteSubject) {
              setSelectedSubject(updatedSyllabus[0] || null);
          }
          setConfirmingDeleteSubject(null);
      }
  }

  const handleSaveChapter = (chapterData: Omit<Chapter, 'id'> & { id?: string }) => {
    if (!selectedSubject) return;
    let updatedChapters;
    if (chapterData.id) { // Editing
        updatedChapters = selectedSubject.chapters.map(c => c.id === chapterData.id ? { ...c, ...chapterData } : c);
    } else { // Adding
        const newChapter: Chapter = { id: Date.now().toString(), ...chapterData };
        updatedChapters = [...selectedSubject.chapters, newChapter];
    }
    const updatedSubject = { ...selectedSubject, chapters: updatedChapters };
    const updatedSyllabus = data.syllabus.map(s => s.id === selectedSubject.id ? updatedSubject : s);
    setData({ ...data, syllabus: updatedSyllabus });
    setSelectedSubject(updatedSubject);
    setChapterModal({isOpen: false, chapter: null});
  }

  const handleDeleteChapter = (id: string) => {
      setConfirmingDeleteChapter(id);
  }

  const handleConfirmDeleteChapter = () => {
      if (!confirmingDeleteChapter || !selectedSubject) return;
      const updatedChapters = selectedSubject.chapters.filter(c => c.id !== confirmingDeleteChapter);
      const updatedSubject = { ...selectedSubject, chapters: updatedChapters };
      const updatedSyllabus = data.syllabus.map(s => s.id === selectedSubject.id ? updatedSubject : s);
      setData({ ...data, syllabus: updatedSyllabus });
      setSelectedSubject(updatedSubject);
      setConfirmingDeleteChapter(null);
  }
  
  const subjectToDelete = confirmingDeleteSubject ? data.syllabus.find(s => s.id === confirmingDeleteSubject) : null;
  const chapterToDelete = confirmingDeleteChapter && selectedSubject ? selectedSubject.chapters.find(c => c.id === confirmingDeleteChapter) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-bold text-white">Syllabus</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Subject List */}
        <div className="md:w-1/3 bg-surface p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Subjects</h2>
            <button onClick={() => setSubjectModal({isOpen: true, subject: null})} className="p-2 text-gray-400 hover:text-white"><PlusIcon className="w-5 h-5"/></button>
          </div>
          <ul className="space-y-2">
            {data.syllabus.map(subject => (
              <li key={subject.id}>
                <button
                  onClick={() => setSelectedSubject(subject)}
                  className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                    selectedSubject?.id === subject.id ? 'bg-primary text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  {subject.name}
                </button>
              </li>
            ))}
             {data.syllabus.length === 0 && <p className="text-on-surface-secondary text-center text-sm py-4">No subjects added.</p>}
          </ul>
        </div>
        
        {/* Chapter Details */}
        <div className="md:w-2/3 bg-surface p-6 rounded-lg shadow-lg">
          {selectedSubject ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedSubject.name}</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setSubjectModal({isOpen: true, subject: selectedSubject})} className="p-2 text-gray-400 hover:text-white"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleDeleteSubject(selectedSubject.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                    <button onClick={() => setChapterModal({isOpen: true, chapter: null})} className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary/40"><PlusIcon className="w-5 h-5"/></button>
                </div>
              </div>
              <ul className="space-y-4">
                {selectedSubject.chapters.map(chapter => {
                    const statusColor = {
                        'Noob': 'bg-red-500',
                        'In Progress': 'bg-yellow-500',
                        'Mastered': 'bg-green-500'
                    }[chapter.status];

                    return (
                        <li key={chapter.id} className="bg-gray-700/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-white">{chapter.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${statusColor}`}>{chapter.status}</span>
                                  <button onClick={() => setChapterModal({isOpen: true, chapter: chapter})} className="p-1 text-gray-400 hover:text-white"><PencilIcon className="w-4 h-4"/></button>
                                  <button onClick={() => handleDeleteChapter(chapter.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${chapter.progress}%` }}></div>
                            </div>
                            <p className="text-right text-sm mt-1 text-on-surface-secondary">{chapter.progress}% Complete</p>
                        </li>
                    );
                })}
                {selectedSubject.chapters.length === 0 && <p className="text-on-surface-secondary text-center py-8">No chapters in this subject yet.</p>}
              </ul>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-on-surface-secondary">Select or create a subject to see details.</p>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={subjectModal.isOpen} onClose={() => setSubjectModal({isOpen: false, subject: null})} title={subjectModal.subject ? 'Edit Subject' : 'Add Subject'}>
        <SubjectForm subject={subjectModal.subject} onSave={handleSaveSubject} onCancel={() => setSubjectModal({isOpen: false, subject: null})}/>
      </Modal>
      <Modal isOpen={chapterModal.isOpen} onClose={() => setChapterModal({isOpen: false, chapter: null})} title={chapterModal.chapter ? 'Edit Chapter' : 'Add Chapter'}>
        <ChapterForm chapter={chapterModal.chapter} onSave={handleSaveChapter} onCancel={() => setChapterModal({isOpen: false, chapter: null})}/>
      </Modal>
      <ConfirmationDialog
        isOpen={!!confirmingDeleteSubject}
        onClose={() => setConfirmingDeleteSubject(null)}
        onConfirm={handleConfirmDeleteSubject}
        title="Delete Subject"
      >
        Are you sure you want to delete the subject "{subjectToDelete?.name}"? All its chapters and associated exams will also be deleted.
      </ConfirmationDialog>
      <ConfirmationDialog
        isOpen={!!confirmingDeleteChapter}
        onClose={() => setConfirmingDeleteChapter(null)}
        onConfirm={handleConfirmDeleteChapter}
        title="Delete Chapter"
      >
        Are you sure you want to delete the chapter "{chapterToDelete?.name}"?
      </ConfirmationDialog>
    </div>
  );
};

export default Syllabus;
