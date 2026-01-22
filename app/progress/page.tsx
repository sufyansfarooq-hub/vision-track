'use client';

import { useState, useEffect } from 'react';
import { supabase, ensureAuth, getCurrentUserId } from '@/lib/supabase/client';
import { MultiRegionColorFill } from '@/components/MultiRegionColorFill';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Filter, SortAsc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Snapshot {
  id: string;
  goal_id: string;
  milestone_percentage: number;
  total_milestones: number;
  completed_milestones: number;
  captured_at: string;
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
}

interface VisionBoard {
  image_url: string;
}

interface SnapshotWithGoal extends Snapshot {
  goal: Goal;
  visionBoard: VisionBoard;
}

function getMilestoneBadge(percentage: number) {
  if (percentage >= 100) {
    return { emoji: '🎉', text: 'Completed!', glow: true };
  } else if (percentage >= 75) {
    return { emoji: '🌳', text: 'Almost Done', glow: false };
  } else if (percentage >= 50) {
    return { emoji: '🌿', text: 'Halfway There', glow: false };
  } else {
    return { emoji: '🌱', text: 'Getting Started', glow: false };
  }
}

function SnapshotCard({ snapshot }: { snapshot: SnapshotWithGoal }) {
  const badge = getMilestoneBadge(snapshot.milestone_percentage);

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-foreground">{snapshot.goal.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(snapshot.captured_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {snapshot.completed_milestones}/{snapshot.total_milestones} milestones
          </p>
        </div>
        <div className="text-5xl font-bold text-foreground">{snapshot.milestone_percentage}%</div>
      </div>

      <div className="mb-6 h-4 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000 ease-out"
          style={{ width: `${snapshot.milestone_percentage}%` }}
        />
      </div>

      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg">
        <MultiRegionColorFill
          imageUrl={snapshot.visionBoard.image_url}
          goals={[
            {
              id: snapshot.goal.id,
              title: snapshot.goal.title,
              progress: snapshot.milestone_percentage,
              region: snapshot.goal.region_coords,
            },
          ]}
        />
      </div>

      <div className="mb-4 flex justify-center">
        <div
          className={`flex items-center gap-2 rounded-full border-2 border-emerald-500 bg-emerald-500/20 px-6 py-3 ${
            badge.glow ? 'shadow-lg shadow-emerald-500/50' : ''
          }`}
        >
          <span className="text-xl">{badge.emoji}</span>
          <span className="font-medium text-foreground">{badge.text}</span>
        </div>
      </div>

      <div className="text-center">
        <Link href={`/goals/${snapshot.goal_id}`} className="text-primary transition-colors hover:underline">
          View Goal Details &rarr;
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="h-8 w-48 rounded bg-secondary" />
          <div className="mt-2 h-4 w-24 rounded bg-secondary" />
          <div className="mt-1 h-3 w-32 rounded bg-secondary" />
        </div>
        <div className="h-12 w-16 rounded bg-secondary" />
      </div>
      <div className="mb-6 h-4 w-full rounded-full bg-secondary" />
      <div className="mb-6 aspect-video w-full rounded-lg bg-secondary" />
      <div className="mb-4 flex justify-center">
        <div className="h-12 w-40 rounded-full bg-secondary" />
      </div>
      <div className="flex justify-center">
        <div className="h-5 w-32 rounded bg-secondary" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-8">
        <Camera className="h-32 w-32 text-muted-foreground" />
      </div>
      <h2 className="mb-4 text-center text-4xl font-bold text-foreground">No snapshots yet!</h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Complete milestones to capture progress at 25%, 50%, 75%, and 100%
      </p>
      <Link href="/goals">
        <Button className="bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90">
          View Your Goals
        </Button>
      </Link>
    </div>
  );
}

export default function ProgressGalleryPage() {
  const [snapshots, setSnapshots] = useState<SnapshotWithGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterMilestone, setFilterMilestone] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      setError('');

      await ensureAuth();
      const userId = await getCurrentUserId();

      if (!userId) throw new Error('Not authenticated');

      const { data: snapshotsData, error: snapshotsError } = await supabase
        .from('progress_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('captured_at', { ascending: false });

      if (snapshotsError) throw snapshotsError;

      const snapshotsWithGoals = await Promise.all(
        (snapshotsData || []).map(async (snapshot) => {
          const { data: goalData } = await supabase
            .from('goals')
            .select('id, title, description, region_coords, vision_board_id')
            .eq('id', snapshot.goal_id)
            .single();

          const { data: vbData } = await supabase
            .from('vision_boards')
            .select('image_url')
            .eq('id', goalData?.vision_board_id)
            .single();

          return {
            ...snapshot,
            goal: goalData,
            visionBoard: vbData,
          };
        })
      );

      setSnapshots(snapshotsWithGoals as SnapshotWithGoal[]);
    } catch (err) {
      console.error('Load snapshots error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  };

  const filteredSnapshots = snapshots
    .filter((s) => (filterMilestone ? s.milestone_percentage === filterMilestone : true))
    .sort((a, b) => {
      const dateA = new Date(a.captured_at).getTime();
      const dateB = new Date(b.captured_at).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-5xl font-bold text-foreground">Progress Gallery</h1>
            <p className="mt-2 text-base text-muted-foreground">
              {filteredSnapshots.length} milestone{filteredSnapshots.length !== 1 ? 's' : ''} captured
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
                >
                  <Filter className="h-4 w-4" />
                  {filterMilestone ? `${filterMilestone}%` : 'Filter'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border bg-card text-foreground">
                <DropdownMenuItem onClick={() => setFilterMilestone(null)}>All Milestones</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMilestone(25)}>25% - Getting Started</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMilestone(50)}>50% - Halfway There</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMilestone(75)}>75% - Almost Done</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMilestone(100)}>100% - Completed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
                >
                  <SortAsc className="h-4 w-4" />
                  {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border bg-card text-foreground">
                <DropdownMenuItem onClick={() => setSortOrder('newest')}>Newest First</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('oldest')}>Oldest First</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/goals">
              <Button
                variant="outline"
                className="gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Goals
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-destructive bg-destructive/20 p-4 text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSnapshots.map((snapshot) => (
              <SnapshotCard key={snapshot.id} snapshot={snapshot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
