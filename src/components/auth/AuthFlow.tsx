import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { Brain, Code, Target } from 'lucide-react';

const AuthFlow: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DSA Mentor</h1>
          <p className="text-gray-300 text-lg">
            Your 12-week transformation to DSA mastery
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <Code className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">84 Days</p>
          </div>
          <div className="text-center">
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Real-time</p>
          </div>
          <div className="text-center">
            <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Expert Mentor</p>
          </div>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          {isSignUp ? <SignUp /> : <SignIn />}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'
              }
            </button>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="mt-8 text-center">
          <blockquote className="text-gray-400 italic text-sm">
            "Excellence is not a skill, it's an attitude. Your 12-week journey starts now."
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;