import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { progressService } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// ... (Interfaces remain the same)
interface Problem {
  problemName: string;
  problemUrl: string;
  completedAt: Date;
  timeSpent: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface DayProgress {
  _id?: string;
  userId: string;
  day: number;
  topic: string;
  videoWatched: boolean;
  problemsCompleted: Problem[];
  notebookCompleted: boolean;
  notebookNotes: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent: number;
}

interface ProgressStats {
  progressHistory: any;
  currentDay: number;
  streak: number;
  totalDaysCompleted: number;
  weeklyProgress: number;
  totalProblemsCompleted: number;
  joinDate: Date;
  preferredLanguage: string;
}

interface ProgressContextType {
  currentProgress: DayProgress | null;
  stats: ProgressStats | null;
  loading: boolean;
  loadDayProgress: (day: number) => Promise<void>;
  updateProgress: (day: number, updates: Partial<DayProgress>) => Promise<void>;
  markProblemComplete: (day: number, problem: Omit<Problem, 'completedAt'>) => Promise<void>;
  loadStats: () => Promise<void>;
}


const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  const [currentProgress, setCurrentProgress] = useState<DayProgress | null>(null);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();

  // FIX 1: Wrap all functions in useCallback
  const loadStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await progressService.getStats(token);
      setStats(response);
    } catch (error: any) {
      console.error('Load stats error:', error);
    }
  }, [token]);

  const loadDayProgress = useCallback(async (day: number) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await progressService.getDayProgress(day, token);
      setCurrentProgress(response.progress);
    } catch (error: any) {
      toast.error('Failed to load progress');
      console.error('Load progress error:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateProgress = useCallback(async (day: number, updates: Partial<DayProgress>) => {
    if (!token) return;
    
    try {
      const response = await progressService.updateProgress(day, updates, token);
      setCurrentProgress(response.progress);
      
      if (updates.completed) {
        toast.success('Day completed! You\'re building unstoppable momentum.');
        await loadStats(); // This function is now stable
      }
    } catch (error: any) {
      toast.error('Failed to update progress');
      console.error('Update progress error:', error);
    }
  }, [token, loadStats]);

  const markProblemComplete = useCallback(async (day: number, problem: Omit<Problem, 'completedAt'>) => {
    if (!token) return;
    
    try {
      await progressService.markProblemComplete(day, problem, token);
      await loadDayProgress(day); // This function is now stable
      toast.success(`Problem "${problem.problemName}" conquered! Keep pushing.`);
    } catch (error: any) {
      toast.error('Failed to mark problem as complete');
      console.error('Mark problem complete error:', error);
    }
  }, [token, loadDayProgress]);

  useEffect(() => {
    if (user && token) {
      loadStats();
      loadDayProgress(user.currentDay);
    }
  }, [user, token, loadStats, loadDayProgress]); // It's safe to include the memoized functions now

  // FIX 2: Memoize the context value object itself with useMemo
  const value = useMemo(() => ({
    currentProgress,
    stats,
    loading,
    loadDayProgress,
    updateProgress,
    markProblemComplete,
    loadStats
  }), [
    currentProgress,
    stats,
    loading,
    loadDayProgress,
    updateProgress,
    markProblemComplete,
    loadStats
  ]);

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};