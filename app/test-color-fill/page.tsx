'use client';

import { useState } from 'react';
import { MultiRegionColorFill } from '@/components/MultiRegionColorFill';

export default function TestPage() {
  const [goals, setGoals] = useState([
    {
      id: '1',
      title: 'Buy a House',
      progress: 0,
      region: { x: 5, y: 5, width: 40, height: 40 }
    },
    {
      id: '2',
      title: 'Travel to Japan',
      progress: 0,
      region: { x: 50, y: 5, width: 45, height: 40 }
    },
    {
      id: '3',
      title: 'Get Promoted',
      progress: 0,
      region: { x: 5, y: 50, width: 90, height: 45 }
    }
  ]);

  const updateGoalProgress = (id: string, progress: number) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, progress } : g
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Multi-Region Color Fill Test
          </h1>
          <p className="text-gray-400">
            Move the sliders to see different parts of the image color independently
          </p>
        </div>
        
        <MultiRegionColorFill
          imageUrl="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800"
          goals={goals}
        />

        <div className="space-y-6 bg-gray-800 p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Goal Progress Controls</h2>
          
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-3 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-white font-medium text-lg">
                  {goal.title}
                </label>
                <span className="text-white text-2xl font-bold">
                  {goal.progress}%
                </span>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => updateGoalProgress(goal.id, 0)}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition"
                >
                  0%
                </button>
                <button
                  onClick={() => updateGoalProgress(goal.id, 25)}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition"
                >
                  25%
                </button>
                <button
                  onClick={() => updateGoalProgress(goal.id, 50)}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition"
                >
                  50%
                </button>
                <button
                  onClick={() => updateGoalProgress(goal.id, 75)}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition"
                >
                  75%
                </button>
                <button
                  onClick={() => updateGoalProgress(goal.id, 100)}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-500 transition"
                >
                  100%
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setGoals(goals.map(g => ({ ...g, progress: 100 })))}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition"
          >
            Complete All Goals! 🎉
          </button>
          
          <button
            onClick={() => setGoals(goals.map(g => ({ ...g, progress: 0 })))}
            className="w-full py-4 bg-gray-700 text-white rounded-xl font-bold text-lg hover:bg-gray-600 transition"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}
