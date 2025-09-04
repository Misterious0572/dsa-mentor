import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { useSocket } from '../../contexts/SocketContext';
import { curriculumService } from '../../services/api';
import { Play, CheckCircle, BookOpen, Code, Target, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface CurriculumData {
  day: number;
  topic: string;
  phase: string;
  week: number;
  isReview?: boolean;
}

const DailyLesson: React.FC = () => {
  const { user, token } = useAuth();
  const { currentProgress, updateProgress, markProblemComplete } = useProgress();
  const { socket } = useSocket();
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [problemForm, setProblemForm] = useState({
    problemName: '',
    problemUrl: '',
    timeSpent: 0,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard'
  });

  useEffect(() => {
    const loadCurriculum = async () => {
      if (user && token) {
        try {
          const data = await curriculumService.getDayCurriculum(user.currentDay, token);
          setCurriculum(data);
        } catch (error) {
          console.error('Failed to load curriculum:', error);
        }
      }
    };

    loadCurriculum();
  }, [user, token]);

  const handleVideoComplete = async () => {
    if (currentProgress && !currentProgress.videoWatched) {
      await updateProgress(currentProgress.day, { videoWatched: true });
      toast.success('Video completed! Knowledge absorbed.');
    }
  };

  const handleNotebookUpdate = async (notes: string) => {
    if (currentProgress) {
      await updateProgress(currentProgress.day, { 
        notebookNotes: notes,
        notebookCompleted: notes.length > 50 // Require substantial notes
      });
    }
  };

  const handleProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProgress && problemForm.problemName && problemForm.problemUrl) {
      await markProblemComplete(currentProgress.day, problemForm);
      setProblemForm({
        problemName: '',
        problemUrl: '',
        timeSpent: 0,
        difficulty: 'Medium'
      });
    }
  };

  const handleCompleteDay = async () => {
    if (currentProgress) {
      const canComplete = currentProgress.videoWatched && 
                         currentProgress.problemsCompleted.length >= 2 && 
                         currentProgress.notebookCompleted;
      
      if (!canComplete) {
        toast.error('Complete all requirements before marking the day as done!');
        return;
      }

      await updateProgress(currentProgress.day, { completed: true });
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('lesson_complete', { day: currentProgress.day });
      }
    }
  };

  if (!curriculum || !currentProgress) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completionRate = [
    currentProgress.videoWatched,
    currentProgress.problemsCompleted.length >= 2,
    currentProgress.notebookCompleted
  ].filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              🗓️ Day {curriculum.day}: {curriculum.topic}
            </h1>
            <p className="text-blue-100 text-lg">
              {curriculum.phase} • Week {curriculum.week}
            </p>
            <p className="text-blue-200 mt-2">
              Alright, settle in. Today's challenge is <strong>{curriculum.topic}</strong>. 
              This is a fundamental concept, and I expect you to not just learn it, but to own it by the end of the day.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{completionRate}/3</div>
            <div className="text-sm text-blue-200">Tasks Complete</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 font-medium">Daily Progress</span>
          <span className="text-gray-400 text-sm">{Math.round((completionRate / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completionRate / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Video Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Play className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">🎥 Instructional Video</h2>
          {currentProgress.videoWatched && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
        </div>
        <p className="text-gray-300 mb-4">
          This resource will lay the groundwork. Don't just watch it; absorb it. 
          Your ability to solve today's problems depends on your focus here.
        </p>
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-gray-400 text-sm mb-2">Recommended Video:</p>
          <a 
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(curriculum.topic + ' data structures algorithms tutorial')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Search: {curriculum.topic} Tutorial
          </a>
        </div>
        {!currentProgress.videoWatched && (
          <button
            onClick={handleVideoComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Mark Video as Watched
          </button>
        )}
      </div>

      {/* Problems Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Code className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">
            🧪 Mandatory Problems ({user?.preferredLanguage})
          </h2>
          {currentProgress.problemsCompleted.length >= 2 && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
        </div>
        <p className="text-gray-300 mb-4">
          Theory is useless without practice. Prove your understanding with these.
        </p>

        {/* Completed Problems */}
        {currentProgress.problemsCompleted.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Completed Problems</h3>
            <div className="space-y-2">
              {currentProgress.problemsCompleted.map((problem, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{problem.problemName}</p>
                    <p className="text-gray-400 text-sm">
                      {problem.difficulty} • {problem.timeSpent} minutes
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Problem Form */}
        {currentProgress.problemsCompleted.length < 2 && (
          <form onSubmit={handleProblemSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Problem Name
                </label>
                <input
                  type="text"
                  value={problemForm.problemName}
                  onChange={(e) => setProblemForm({...problemForm, problemName: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Two Sum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Problem URL
                </label>
                <input
                  type="url"
                  value={problemForm.problemUrl}
                  onChange={(e) => setProblemForm({...problemForm, problemUrl: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://leetcode.com/problems/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Time Spent (minutes)
                </label>
                <input
                  type="number"
                  value={problemForm.timeSpent}
                  onChange={(e) => setProblemForm({...problemForm, timeSpent: parseInt(e.target.value)})}
                  min="1"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={problemForm.difficulty}
                  onChange={(e) => setProblemForm({...problemForm, difficulty: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Mark Problem Complete
            </button>
          </form>
        )}

        {/* Problem Suggestions */}
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Suggested Problems:</h3>
          <div className="space-y-2 text-sm">
            <a 
              href={`https://leetcode.com/tag/${curriculum.topic.toLowerCase().replace(/\s+/g, '-')}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300 underline"
            >
              LeetCode: {curriculum.topic} Problems
            </a>
            <a 
              href={`https://www.hackerrank.com/domains/algorithms`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300 underline"
            >
              HackerRank: Algorithm Challenges
            </a>
          </div>
        </div>
      </div>

      {/* Notebook Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">📒 Notebook Mandate</h2>
          {currentProgress.notebookCompleted && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
        </div>
        <p className="text-gray-300 mb-4">
          True understanding comes from articulating the logic yourself. Document your approach, 
          complexity analysis, and edge cases. This isn't busywork; it's how you build a solid, unshakeable foundation.
        </p>
        <textarea
          value={currentProgress.notebookNotes}
          onChange={(e) => handleNotebookUpdate(e.target.value)}
          placeholder="Document your approach, time/space complexity, and edge cases..."
          className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        <p className="text-gray-400 text-sm mt-2">
          {currentProgress.notebookNotes.length}/50 characters minimum
        </p>
      </div>

      {/* Optimization Challenge */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-6 h-6" />
          <h2 className="text-xl font-bold">⚡ The Push for Optimization</h2>
        </div>
        <p className="mb-4">
          A brute-force O(n²) solution is the first thing many people think of, but we're aiming for excellence here. 
          Pushing for the optimal O(n) solution is what separates great engineers from average ones. Find that path. 
          It will be tough, but that's the point.
        </p>
      </div>

      {/* Complete Day Button */}
      <div className="text-center">
        {currentProgress.completed ? (
          <div className="bg-green-600 text-white px-8 py-4 rounded-lg inline-flex items-center space-x-2">
            <CheckCircle className="w-6 h-6" />
            <span className="text-lg font-bold">Day {curriculum.day} Completed!</span>
          </div>
        ) : (
          <button
            onClick={handleCompleteDay}
            disabled={!currentProgress.videoWatched || currentProgress.problemsCompleted.length < 2 || !currentProgress.notebookCompleted}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg text-lg font-bold transition-colors"
          >
            Complete Day {curriculum.day}
          </button>
        )}
        <p className="text-gray-400 mt-4">
          Complete these tasks with full focus. Let me know when you're done, and we'll move on to the next day's challenge.
        </p>
      </div>
    </div>
  );
};

export default DailyLesson;