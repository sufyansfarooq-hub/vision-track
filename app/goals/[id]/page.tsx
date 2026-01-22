'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase, ensureAuth } from '@/lib/supabase/client';
import { MultiRegionColorFill } from '@/components/MultiRegionColorFill';
import { calculateProgress } from '@/lib/utils/progress';
import { MilestoneChat } from '@/components/milestone-chat';
import Link from 'next/link';
import { ArrowLeft, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Milestone {
  id: string;
  title: string;
  position: number;
  is_completed: boolean;
  completed_at: string | null;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  region_coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  vision_board_id: string;
}

interface VisionBoard {
  image_url: string;
}

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [goal, setGoal] = useState<Goal | null>(null);
  const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMilestone, setNewMilestone] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  useEffect(() => {
    loadGoalData();
  }, [id]);

  const loadGoalData = async () => {
    try {
      setLoading(true);
      setError('');

      await ensureAuth();

      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();

      if (goalError) throw goalError;

      setGoal(goalData);

      const { data: vbData, error: vbError } = await supabase
        .from('vision_boards')
        .select('image_url')
        .eq('id', goalData.vision_board_id)
        .single();

      if (vbError) throw vbError;

      setVisionBoard(vbData);

      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('goal_id', id)
        .order('position');

      if (milestonesError) throw milestonesError;

      setMilestones(milestonesData || []);
    } catch (err) {
      console.error('Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goal');
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = async () => {
    if (!newMilestone.trim()) return;

    try {
      setAddingMilestone(true);
      setError('');

      await ensureAuth();

      const { error: insertError } = await supabase.from('milestones').insert({
        goal_id: id,
        title: newMilestone.trim(),
        position: milestones.length,
        is_completed: false,
      });

      if (insertError) throw insertError;

      setNewMilestone('');
      await loadGoalData();
    } catch (err) {
      console.error('Add milestone error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add milestone');
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleChatAddMilestone = async (milestoneTitle: string) => {
    try {
      await ensureAuth();

      const { error: insertError } = await supabase.from('milestones').insert({
        goal_id: id,
        title: milestoneTitle.trim(),
        position: milestones.length,
        is_completed: false,
      });

      if (insertError) throw insertError;

      await loadGoalData();
    } catch (err) {
      console.error('Add milestone from chat error:', err);
      throw err;
    }
  };

  const toggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    try {
      setError('');

      const { error: updateError } = await supabase
        .from('milestones')
        .update({
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', milestoneId);

      if (updateError) throw updateError;

      await loadGoalData();

      const newProgress = calculateProgress(
        milestones.map((m) => (m.id === milestoneId ? { ...m, is_completed: !currentStatus } : m))
      );

      let snapshotLevel = null;
      if (newProgress >= 20 && newProgress <= 35) snapshotLevel = 25;
      else if (newProgress >= 45 && newProgress <= 60) snapshotLevel = 50;
      else if (newProgress >= 70 && newProgress <= 85) snapshotLevel = 75;
      else if (newProgress === 100) snapshotLevel = 100;

      if (snapshotLevel) {
        await captureSnapshot(snapshotLevel);
      }
    } catch (err) {
      console.error('Toggle milestone error:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle milestone');
    }
  };

  const captureSnapshot = async (progress: number) => {
    try {
      const userId = await supabase.auth.getUser().then((res) => res.data.user?.id);
      if (!userId) return;

      const { data: existing } = await supabase
        .from('progress_snapshots')
        .select('id')
        .eq('goal_id', id)
        .eq('milestone_percentage', progress)
        .single();

      if (existing) return;

      await supabase.from('progress_snapshots').insert({
        goal_id: id,
        user_id: userId,
        milestone_percentage: progress,
        total_milestones: milestones.length,
        completed_milestones: milestones.filter((m) => m.is_completed).length,
      });
    } catch (err) {
      console.error('Snapshot capture error:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addMilestone();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white">Loading goal...</p>
        </div>
      </div>
    );
  }

  if (error || !goal || !visionBoard) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Goal not found</h2>
          <p className="text-gray-400 mb-6">{error || 'This goal does not exist'}</p>
          <Link href="/goals">
            <Button className="bg-blue-600 text-white hover:bg-blue-500">Back to Goals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(milestones);
  const completedCount = milestones.filter((m) => m.is_completed).length;
  const totalCount = milestones.length;

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/goals" className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>
          <Link href="/check-in">
            <Button variant="secondary" size="sm" className="bg-[#374151] text-white hover:bg-[#4B5563]">
              Check-in
            </Button>
          </Link>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">{goal.title}</h1>
          <p className="text-base text-gray-400">{goal.description}</p>
        </div>

        {/* Progress Section */}
        <div className="mb-8 rounded-2xl bg-[#1F2937] p-6 sm:p-8">
          <div className="mb-4 flex items-end justify-between">
            <span className="text-base text-gray-400">Progress</span>
            <span className="text-6xl font-bold text-white sm:text-7xl lg:text-8xl">{progress}%</span>
          </div>
          <div className="h-8 overflow-hidden rounded-full bg-[#374151]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Vision Board */}
        <div className="relative mb-8 overflow-hidden rounded-xl shadow-lg">
          <MultiRegionColorFill
            imageUrl={visionBoard.image_url}
            goals={[
              {
                id: goal.id,
                title: goal.title,
                progress,
                region: goal.region_coords,
              },
            ]}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 p-4 rounded-lg text-red-200">{error}</div>
        )}

        {/* Milestones Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">
            Milestones ({completedCount}/{totalCount})
          </h2>

          {/* Add Milestone Input */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <Input
              type="text"
              placeholder="Add a new milestone..."
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={addingMilestone}
              className="h-12 flex-1 border-none bg-[#1F2937] text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500"
            />
            <Button
              onClick={addMilestone}
              disabled={addingMilestone || !newMilestone.trim()}
              className="h-12 bg-blue-600 px-6 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="mr-2 h-5 w-5" />
              {addingMilestone ? 'Adding...' : 'Add'}
            </Button>
          </div>

          {/* Milestone List */}
          {milestones.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-[#1F2937] py-16">
              <p className="mb-2 text-lg text-gray-400">No milestones yet</p>
              <p className="text-sm text-gray-500">Break this goal into actionable steps</p>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => toggleMilestone(milestone.id, milestone.is_completed)}
                  className="flex cursor-pointer items-center gap-4 rounded-lg bg-[#1F2937] p-4 transition-colors hover:bg-[#2D3748]"
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                      milestone.is_completed ? 'border-emerald-500 bg-emerald-500' : 'border-gray-500 bg-transparent'
                    }`}
                  >
                    {milestone.is_completed && <Check className="h-4 w-4 text-white" />}
                  </div>

                  <span
                    className={`flex-1 transition-all duration-200 ${
                      milestone.is_completed ? 'text-gray-500 line-through' : 'text-white'
                    }`}
                  >
                    {milestone.title}
                  </span>

                  {milestone.completed_at && (
                    <span className="text-sm text-gray-500">
                      {new Date(milestone.completed_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Milestone Assistant Chatbot */}
        <MilestoneChat
          goalTitle={goal.title}
          goalDescription={goal.description}
          existingMilestones={milestones.map((m) => m.title)}
          onAddMilestone={handleChatAddMilestone}
        />
      </div>
    </div>
  );
}
