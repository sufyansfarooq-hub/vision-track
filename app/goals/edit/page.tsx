'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { InteractiveRegionEditor } from '@/components/InteractiveRegionEditor';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Goal {
  id: string;
  title: string;
  region_coords?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  region?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  vision_board_id?: string;
  user_id?: string;
  is_active?: boolean;
}
export default function EditRegionsPage() {
  const router = useRouter();
  const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
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
          .eq('is_active', true);

if (goalsData) {
  const mappedGoals = goalsData.map(goal => ({
    ...goal,
    region: goal.region_coords
  }));
  setGoals(mappedGoals);
}
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(updatedGoals: Goal[]) {
    setSaving(true);
    setAlert(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find goals to insert (new ones with temp_ prefix)
      const newGoals = updatedGoals.filter(g => g.id.startsWith('temp_'));
      
      // Find goals to update (existing ones)
      const existingGoals = updatedGoals.filter(g => !g.id.startsWith('temp_'));

      // Find goals to delete (soft delete)
      const deletedGoalIds = goals
        .filter(g => !updatedGoals.find(ug => ug.id === g.id))
        .map(g => g.id);

      // Insert new goals
      if (newGoals.length > 0 && visionBoard) {
        const { error: insertError } = await supabase
          .from('goals')
          .insert(
            newGoals.map(g => ({
              vision_board_id: visionBoard.id,
              user_id: user.id,
              title: g.title,
              region_coords: g.region_coords,
              is_active: true
            }))
          );

        if (insertError) throw insertError;
      }

      // Update existing goals
      for (const goal of existingGoals) {
        const { error: updateError } = await supabase
          .from('goals')
          .update({ region_coords: goal.region_coords })
          .eq('id', goal.id);

        if (updateError) throw updateError;
      }

      // Soft delete removed goals
      if (deletedGoalIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('goals')
          .update({ is_active: false })
          .in('id', deletedGoalIds);

        if (deleteError) throw deleteError;
      }

      setAlert({ type: 'success', message: 'Changes saved successfully!' });
      setTimeout(() => {
        router.push('/goals');
      }, 1500);

    } catch (error: any) {
      console.error('Error saving:', error);
      setAlert({ type: 'error', message: error.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-700 font-medium">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!visionBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 font-medium">No vision board found</p>
          <Link href="/upload" className="text-blue-600 hover:text-blue-700 font-semibold mt-4 inline-block">
            Upload a vision board
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-purple-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/goals"
                className="w-10 h-10 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-purple-400 hover:shadow-md transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Goal Regions
                </h1>
                <p className="text-sm text-gray-600 font-medium">Adjust boundaries or add new goals</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Alert */}
        {alert && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            alert.type === 'success'
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300'
              : 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              {alert.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
              )}
              <p className={`font-medium ${
                alert.type === 'success' ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {alert.message}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-lg mb-6">
          <h2 className="font-bold text-gray-900 mb-3">How to Edit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Select Mode</div>
                <div className="text-gray-600">Click a region to select, then drag to move or resize</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Draw Mode</div>
                <div className="text-gray-600">Click "Draw New Goal" to add regions manually</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-semibold text-gray-900 mb-1">Save Changes</div>
                <div className="text-gray-600">Click "Save Changes" when done</div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <InteractiveRegionEditor
          imageUrl={visionBoard.image_url}
          initialGoals={goals}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  );
}
