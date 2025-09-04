import React from 'react';
import { Brain } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your progress...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;