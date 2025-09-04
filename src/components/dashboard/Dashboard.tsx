import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import DailyLesson from './DailyLesson';
import ProgressOverview from './ProgressOverview';
import MFASetup from './MFASetup';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';

const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'lesson' | 'progress' | 'mfa'>('lesson');
  const { user } = useAuth();
  const { loadDayProgress } = useProgress();

  useEffect(() => {
    if (user) {
      loadDayProgress(user.currentDay);
    }
  }, [user, loadDayProgress]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'lesson' && <DailyLesson />}
        {currentView === 'progress' && <ProgressOverview />}
        {currentView === 'mfa' && <MFASetup />}
      </main>
    </div>
  );
};

export default Dashboard;