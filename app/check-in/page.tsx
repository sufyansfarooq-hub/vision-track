'use client';

import { useState, useEffect } from 'react';
import { supabase, ensureAuth, getCurrentUserId } from '@/lib/supabase/client';

const moods = [
  { emoji: '😞', label: 'Struggling', value: 1 },
  { emoji: '😕', label: 'Tough', value: 2 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😄', label: 'Great', value: 5 },
];

interface CheckinData {
  mood: typeof moods[number];
  reflection: string;
  timestamp: Date;
}

export default function DailyCheckinPage() {
  const [selectedMood, setSelectedMood] = useState<typeof moods[number] | null>(null);
  const [reflection, setReflection] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [checkinData, setCheckinData] = useState<CheckinData | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingCheckin();
  }, []);

  const checkExistingCheckin = async () => {
    try {
      await ensureAuth();
      const userId = await getCurrentUserId();
      const today = new Date().toISOString().split('T')[0];

      // Check if already checked in today
      const { data: existing } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existing) {
        const mood = moods.find((m) => m.value === existing.mood);
        setCheckinData({
          mood: mood!,
          reflection: existing.reflection_text || '',
          timestamp: new Date(existing.created_at),
        });
        setIsCompleted(true);
      }

      // Calculate streak
      await calculateStreak(userId);
    } catch (err) {
      console.error('Check-in check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = async (userId: string) => {
    try {
      const { data: reflections } = await supabase
        .from('daily_reflections')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!reflections || reflections.length === 0) {
        setStreak(0);
        return;
      }

      const dates = reflections.map((r) => new Date(r.date).toISOString().split('T')[0]);
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (dates[0] !== today && dates[0] !== yesterday) {
        setStreak(0);
        return;
      }

      let currentStreak = 0;
      let checkDate = new Date(dates[0]);

      for (const dateStr of dates) {
        const expectedDate = new Date(checkDate).toISOString().split('T')[0];
        if (dateStr === expectedDate) {
          currentStreak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else {
          break;
        }
      }

      setStreak(currentStreak);
    } catch (err) {
      console.error('Streak calculation error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    try {
      await ensureAuth();
      const userId = await getCurrentUserId();
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('daily_reflections').insert({
        user_id: userId,
        date: today,
        mood: selectedMood.value,
        reflection_text: reflection.trim() || null,
      });

      if (error) throw error;

      const data: CheckinData = {
        mood: selectedMood,
        reflection: reflection.trim(),
        timestamp: new Date(),
      };
      setCheckinData(data);
      setIsCompleted(true);
      setStreak((prev) => prev + 1);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save check-in. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isCompleted && checkinData) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <div className="bg-[#1F2937] rounded-2xl p-12 text-center">
            <div className="text-[128px] leading-none mb-6">{checkinData.mood.emoji}</div>
            <h1 className="text-4xl font-bold text-white mb-4">Today's Check-in Complete!</h1>
            <div className="text-lg text-gray-400 mb-2">
              You're feeling <span className="text-white font-medium">{checkinData.mood.label}</span>
            </div>
            <div className="text-sm text-gray-500 mb-6">
              {checkinData.timestamp.toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </div>

            {checkinData.reflection && (
              <div className="bg-[#374151] rounded-xl p-6 mb-6 text-left">
                <div className="text-gray-400 text-sm mb-2">Your reflection:</div>
                <p className="text-white italic">&ldquo;{checkinData.reflection}&rdquo;</p>
              </div>
            )}

            <p className="text-gray-500">Come back tomorrow for your next check-in!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center p-4 gap-8">
      {streak > 0 && (
        <div className="w-full max-w-xl">
          <div className="bg-gradient-to-r from-[#F97316] to-[#DC2626] rounded-2xl p-12 text-center">
            <div className="text-[96px] leading-none mb-4 animate-pulse">🔥</div>
            <h2 className="text-6xl font-bold text-white mb-2">{streak} Day Streak!</h2>
            <p className="text-white text-lg">Keep it going!</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl">
        <div className="bg-[#1F2937] rounded-2xl p-12">
          <h1 className="text-3xl font-bold text-white text-center mb-10">How are you feeling?</h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood)}
                className={`
                  w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-2
                  transition-all duration-200 cursor-pointer
                  ${
                    selectedMood?.value === mood.value
                      ? 'bg-[#3B82F6] scale-105 border-2 border-white'
                      : 'bg-[#374151] hover:scale-102 border-2 border-transparent'
                  }
                `}
              >
                <span className="text-5xl sm:text-6xl lg:text-[80px] leading-none">{mood.emoji}</span>
                <span className="text-sm text-white font-medium">{mood.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-8">
            <label className="block text-white text-base mb-3">What's on your mind? (Optional)</label>
            <textarea
              rows={6}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Any thoughts, wins, or challenges from today..."
              className="w-full bg-[#1F2937] border border-[#374151] text-white rounded-lg p-4 resize-none
                placeholder:text-gray-500 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]
                transition-colors"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedMood}
            className={`
              w-full h-14 rounded-lg text-lg font-bold text-white transition-all duration-200
              ${
                selectedMood
                  ? 'bg-[#3B82F6] hover:bg-[#60A5FA] hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-[#374151] cursor-not-allowed opacity-50'
              }
            `}
          >
            Submit Check-in
          </button>
        </div>
      </div>
    </div>
  );
}
