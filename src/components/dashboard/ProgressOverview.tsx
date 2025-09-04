import React, { useEffect, useState } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Flame, Trophy, Clock, Target, TrendingUp } from 'lucide-react';

const ProgressOverview: React.FC = () => {
  const { stats, loadStats } = useProgress();
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    // TWEAK: Changed dependency from [loadStats] to [] to prevent an infinite loop.
  }, []);

  useEffect(() => {
    // Generate weekly progress data for chart
    if (stats) {
      const weeks = [];
      for (let week = 1; week <= 12; week++) {
        const startDay = (week - 1) * 7 + 1;
        const endDay = Math.min(week * 7, 84);
        const completed = Math.max(0, Math.min(7, stats.totalDaysCompleted - startDay + 1));
        
        weeks.push({
          week: `Week ${week}`,
          completed: completed > 0 ? completed : 0,
          total: endDay - startDay + 1
        });
      }
      setWeeklyData(weeks);
    }
  }, [stats]);

  if (!stats || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const daysInProgram = Math.floor((Date.now() - new Date(stats.joinDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const expectedProgress = Math.min(daysInProgram, 84);
  const progressPercentage = (stats.totalDaysCompleted / 84) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Your DSA Journey</h1>
        <p className="text-gray-400">
          Track your relentless pursuit of algorithmic excellence
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Current Day</p>
              <p className="text-3xl font-bold">{stats.currentDay}</p>
              <p className="text-blue-200 text-xs">of 84 days</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm">Current Streak</p>
              <p className="text-3xl font-bold">{stats.streak}</p>
              <p className="text-orange-200 text-xs">consecutive days</p>
            </div>
            <Flame className="w-8 h-8 text-orange-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm">Days Completed</p>
              <p className="text-3xl font-bold">{stats.totalDaysCompleted}</p>
              <p className="text-green-200 text-xs">{progressPercentage.toFixed(1)}% complete</p>
            </div>
            <Trophy className="w-8 h-8 text-green-300" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Problems Solved</p>
              <p className="text-3xl font-bold">{stats.totalProblemsCompleted}</p>
              <p className="text-purple-200 text-xs">total problems</p>
            </div>
            <Target className="w-8 h-8 text-purple-300" />
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Weekly Progress</span>
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Bar 
                dataKey="completed" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Performance Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Consistency Rate</span>
              <span className="text-white font-bold">
                {((stats.totalDaysCompleted / expectedProgress) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Weekly Average</span>
              <span className="text-white font-bold">
                {(stats.weeklyProgress).toFixed(1)} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Problems per Day</span>
              <span className="text-white font-bold">
                {(stats.totalProblemsCompleted / Math.max(stats.totalDaysCompleted, 1)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Motivational Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Days in Program</span>
              <span className="text-white font-bold">{daysInProgram}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Language Mastery</span>
              <span className="text-white font-bold">{stats.preferredLanguage}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Completion ETA</span>
              <span className="text-white font-bold">
                {Math.max(0, 84 - stats.currentDay)} days left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-bold text-white mb-2">Coach's Assessment</h3>
        <p className="text-gray-300">
          {stats.streak >= 7 
            ? `Outstanding discipline! Your ${stats.streak}-day streak shows you're building the habits of a champion. Keep this momentum - you're exactly where you need to be.`
            : stats.totalDaysCompleted >= expectedProgress
            ? `You're keeping pace with the program. Good. But don't get comfortable - the real challenges are ahead. Stay hungry.`
            : `You're falling behind the expected pace. This is where champions separate themselves from the rest. Time to step up your game and show what you're made of.`
          }
        </p>
      </div>
    </div>
  );
};

export default ProgressOverview;