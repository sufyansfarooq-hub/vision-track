'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { MultiRegionColorFill } from '@/components/MultiRegionColorFill';
import { TrendingUp, Target, Flame, Calendar, ArrowRight, Zap, Trophy, Clock, CheckCircle2 } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  progress: number;
  region: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface Milestone {
  id: string;
  title: string;
  is_completed: boolean;
  completed_at: string | null;
  goal_id: string;
}

interface VisionBoard {
  id: string;
  image_url: string;
  title: string;
}

export default function DashboardPage() {
  const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch vision board
      const { data: boardData } = await supabase
        .from('vision_boards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (boardData) {
        setVisionBoard(boardData);

        // Fetch goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('vision_board_id', boardData.id)
          .eq('is_active', true);

        if (goalsData) {
          const mappedGoals = goalsData.map(goal => ({
            ...goal,
            region: goal.region_coords
          }));
          setGoals(mappedGoals);

          // Fetch milestones
          const goalIds = goalsData.map(g => g.id);
          const { data: milestonesData } = await supabase
            .from('milestones')
            .select('*')
            .in('goal_id', goalIds)
            .order('created_at', { ascending: false });

          if (milestonesData) {
            setMilestones(milestonesData);
          }
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
          <p className="text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => g.progress < 100);
  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;

  const completedMilestones = milestones.filter(m => m.is_completed).length;
  const totalMilestones = milestones.length;
  const completionRate = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;

  const recentMilestones = milestones
    .filter(m => m.is_completed && m.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5);

  const progressHighlights = goals
    .filter(g => g.progress > 0 && g.progress < 100)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  const nextMilestones = milestones
    .filter(m => !m.is_completed)
    .slice(0, 5);

  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

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
                  Analytics Dashboard
                </h1>
                <p className="text-xs text-gray-600 font-medium">Your Command Center</p>
              </div>
            </div>
            <Link
              href="/goals"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium text-sm"
            >
              View Goals
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Vision Board */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Vision Board */}
            {visionBoard && (
              <div className="bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-purple-600" />
                  Your Vision Board
                </h2>
                <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                  <MultiRegionColorFill
                    imageUrl={visionBoard.image_url}
                    goals={goals}
                  />
                </div>
              </div>
            )}

            {/* Progress Highlights */}
            {progressHighlights.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-blue-600" />
                  Progress Highlights
                </h2>
                <div className="space-y-4">
                  {progressHighlights.map((goal) => (
                    <Link
                      key={goal.id}
                      href={`/goals/${goal.id}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition">{goal.title}</span>
                        <span className="text-sm font-bold text-gray-900">{Math.round(goal.progress)}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentMilestones.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-emerald-600" />
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {recentMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{milestone.title}</div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {milestone.completed_at && getTimeAgo(milestone.completed_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            
            {/* Total Achievement */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-purple-300 shadow-lg">
              <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">Total Achievement</div>
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {totalProgress}%
              </div>
              <div className="text-sm text-emerald-600 font-bold mb-4">+5.2% this week</div>
              <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border-2 border-blue-200 shadow-md">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{goals.length}</div>
                <div className="text-xs text-gray-600 font-medium">Total Goals</div>
              </div>

              <div className="bg-white p-5 rounded-xl border-2 border-orange-200 shadow-md">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">14</div>
                <div className="text-xs text-gray-600 font-medium">Day Streak</div>
              </div>

              <div className="bg-white p-5 rounded-xl border-2 border-purple-200 shadow-md">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
                <div className="text-xs text-gray-600 font-medium">Completion Rate</div>
              </div>

              <div className="bg-white p-5 rounded-xl border-2 border-emerald-200 shadow-md">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">85.4</div>
                <div className="text-xs text-gray-600 font-medium">Milestones/Week</div>
              </div>
            </div>

            {/* Critical Milestones */}
            {nextMilestones.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border-2 border-rose-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  Next Up
                </h3>
                <div className="space-y-2">
                  {nextMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg transition group"
                    >
                      <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition">
                        {milestone.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
