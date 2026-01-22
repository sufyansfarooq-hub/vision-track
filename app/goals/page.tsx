'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { TrendingUp, Edit3, Plus, Target, Calendar, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  progress: number;
  region_coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  vision_board_id: string;
  created_at: string;
}

interface VisionBoard {
  id: string;
  image_url: string;
  title: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoalsAndBoard();
  }, []);

  async function fetchGoalsAndBoard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: boardData } = await supabase
        .from('vision_boards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (boardData) {
        setVisionBoard(boardData);

        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('vision_board_id', boardData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (goalsData) {
          setGoals(goalsData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Target className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-700 font-medium">Loading your goals...</p>
        </div>
      </div>
    );
  }

  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;

  const completedGoals = goals.filter(g => g.progress === 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
{/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-purple-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  VisionTrack
                </h1>
                <p className="text-xs text-gray-600 font-medium">Your Goals</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/landing"
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-purple-400 hover:shadow-md transition font-medium text-sm"
              >
                Landing Page
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium text-sm flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {goals.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Active Goals</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {totalProgress}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Average Progress</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {completedGoals}
                </div>
                <div className="text-sm text-gray-600 font-medium">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/upload"
              className="group bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-purple-700 transition">Upload New Board</div>
                  <div className="text-sm text-gray-600">Start fresh with a new vision</div>
                </div>
              </div>
            </Link>

            <Link
              href="/goals/edit"
              className="group bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-blue-700 transition">Edit Regions</div>
                  <div className="text-sm text-gray-600">Adjust goal boundaries</div>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="group bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-emerald-700 transition">View Analytics</div>
                  <div className="text-sm text-gray-600">Track your progress</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Goals List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Goals</h2>
          
          {goals.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border-2 border-gray-200 text-center shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-6">Upload a vision board to get started</p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition"
              >
                <Plus className="w-5 h-5" />
                Upload Vision Board
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <Link
                  key={goal.id}
                  href={`/goals/${goal.id}`}
                  className="group bg-white p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition flex-1">
                      {goal.title}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 font-medium">Progress</span>
                      <span className="text-sm font-bold text-gray-900">{Math.round(goal.progress)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {goal.progress === 100 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-300 text-emerald-700 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : goal.progress > 0 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-300 text-blue-700 rounded-full text-xs font-bold">
                        <Zap className="w-3 h-3" />
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-xs font-bold">
                        <Calendar className="w-3 h-3" />
                        Not Started
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
