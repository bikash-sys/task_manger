
import React, { useState } from 'react';
import { NAV_ITEMS, AppView } from './constants';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Goals from './components/Goals';
import Syllabus from './components/Syllabus';
import Exams from './components/Exams';
import TimeTable from './components/TimeTable';
import AIAssistant from './components/AIAssistant';

const BottomNav: React.FC<{
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-700 z-40">
      <ul className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => (
          <li key={item.view} className="flex-1">
            <button
              onClick={() => setCurrentView(item.view)}
              className={`w-full h-full flex flex-col items-center justify-center transition-colors duration-200 ${
                currentView === item.view
                  ? 'text-primary'
                  : 'text-on-surface-secondary hover:text-white'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1 truncate px-1">{item.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.Dashboard);

  const renderView = () => {
    switch (currentView) {
      case AppView.Dashboard:
        return <Dashboard />;
      case AppView.Tasks:
        return <Tasks />;
      case AppView.Goals:
        return <Goals />;
      case AppView.Syllabus:
        return <Syllabus />;
      case AppView.Exams:
        return <Exams />;
      case AppView.TimeTable:
        return <TimeTable />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background font-sans">
      {/* Sidebar Navigation */}
      <nav className="hidden md:flex w-64 bg-surface p-5 flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-10">Aura</h1>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.view}>
                <button
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full text-left flex items-center p-3 my-2 rounded-lg transition-colors duration-200 ${
                    currentView === item.view
                      ? 'bg-primary text-white'
                      : 'text-on-surface-secondary hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-6 w-6 mr-3" />
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-xs text-left text-on-surface-secondary">
          <p className="font-bold text-base text-on-surface mb-1">Aura:</p>
          <p>
            <span className="font-bold text-primary">A</span>utonomous{' '}
            <span className="font-bold text-primary">U</span>niversal{' '}
            <span className="font-bold text-primary">R</span>outine{' '}
            <span className="font-bold text-primary">A</span>ssistant
          </p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 mb-16 md:mb-0">
        {renderView()}
      </main>

      <div className="hidden md:block fixed bottom-2 right-24 text-right text-xs text-on-surface-secondary/50 pointer-events-none">
          <p>Made in India</p>
          <p>Made by Gusain Studio</p>
      </div>

      {/* AI Assistant FAB */}
      <AIAssistant />

      {/* Bottom Navigation for Mobile */}
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default App;
