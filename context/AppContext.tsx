
import React, { createContext, useContext, ReactNode, useMemo, Dispatch, SetStateAction } from 'react';
import { AppData } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_APP_DATA } from '../constants';

interface AppContextType {
  data: AppData;
  // Fix: Update setData type to allow functional updates, matching the useLocalStorage hook.
  setData: Dispatch<SetStateAction<AppData>>;
  // We can add more specific setters later if needed
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [storedData, setStoredData] = useLocalStorage<AppData>('appData', INITIAL_APP_DATA);

  const data = useMemo(() => {
    // This ensures that the data object always has all the required arrays.
    // It guards against malformed or outdated data in localStorage, which
    // could cause crashes if a component tries to call .filter() or another
    // array method on an undefined value.
    return {
      tasks: storedData?.tasks || [],
      goals: storedData?.goals || [],
      syllabus: storedData?.syllabus || [],
      exams: storedData?.exams || [],
      timeTable: storedData?.timeTable || [],
    };
  }, [storedData]);


  const contextValue: AppContextType = {
    data,
    setData: setStoredData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
