'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Trash2, Plus, Check, X } from 'lucide-react';

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Goal {
  id: string;
  title: string;
  region_coords?: Region;
  region?: Region; // For compatibility
}

interface InteractiveRegionEditorProps {
  imageUrl: string;
  initialGoals: Goal[];
  onSave: (goals: Goal[]) => void;
  saving?: boolean;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

export function InteractiveRegionEditor({
  imageUrl,
  initialGoals,
  onSave,
  saving = false,
}: InteractiveRegionEditorProps) {
 const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [mode, setMode] = useState<'select' | 'draw'>('select');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<Region | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingRegion, setIsDraggingRegion] = useState(false);
  const [dragHandle, setDragHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [showTitleInput, setShowTitleInput] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const getRelativePosition = (e: React.MouseEvent): { x: number; y: number } => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  // Drawing new regions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'draw') return;
    
    const pos = getRelativePosition(e);
    setIsDrawing(true);
    setDrawStart(pos);
    setCurrentDraw({ x: pos.x, y: pos.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && drawStart) {
      const pos = getRelativePosition(e);
      const x = Math.min(drawStart.x, pos.x);
      const y = Math.min(drawStart.y, pos.y);
      const width = Math.abs(pos.x - drawStart.x);
      const height = Math.abs(pos.y - drawStart.y);
      
      setCurrentDraw({ x, y, width, height });
    } else if ((isDragging || isDraggingRegion) && dragStart && selectedGoalId) {
      handleResizeMove(e);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentDraw && currentDraw.width > 2 && currentDraw.height > 2) {
      setShowTitleInput(true);
    } else {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDraw(null);
    }
    
    if (isDragging || isDraggingRegion) {
      handleResizeEnd();
    }
  };

  const saveNewGoal = () => {
    if (!currentDraw || !newGoalTitle.trim()) return;

    const newGoal: Goal = {
      id: `temp_${Date.now()}`,
      title: newGoalTitle.trim(),
      region: currentDraw,
    };

    onGoalsUpdate([...goals, newGoal]);
    
    // Reset
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraw(null);
    setNewGoalTitle('');
    setShowTitleInput(false);
    setMode('select');
  };

  const cancelNewGoal = () => {
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraw(null);
    setNewGoalTitle('');
    setShowTitleInput(false);
  };

  // Moving entire region
  const handleRegionDragStart = (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingRegion(true);
    setSelectedGoalId(goalId);
    setDragStart(getRelativePosition(e));
  };

  // Resizing with handles
  const handleResizeStart = (goalId: string, handle: ResizeHandle, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedGoalId(goalId);
    setDragHandle(handle);
    setDragStart(getRelativePosition(e));
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!dragStart || !selectedGoalId) return;

    const pos = getRelativePosition(e);
    const deltaX = pos.x - dragStart.x;
    const deltaY = pos.y - dragStart.y;

    const updatedGoals = goals.map((goal) => {
      if (goal.id !== selectedGoalId) return goal;

      let { x, y, width, height } = goal.region;

      // If dragging the whole region (not a handle)
      if (isDraggingRegion) {
        x = Math.max(0, Math.min(100 - width, x + deltaX));
        y = Math.max(0, Math.min(100 - height, y + deltaY));
        
        return {
          ...goal,
          region: { x, y, width, height },
        };
      }

      // Handle resizing with handles
      if (!dragHandle) return goal;

      // Handle corner resizing
      if (dragHandle.includes('n')) {
        const newY = y + deltaY;
        const newHeight = height - deltaY;
        if (newHeight > 5 && newY >= 0) {
          y = newY;
          height = newHeight;
        }
      }
      if (dragHandle.includes('s')) {
        const newHeight = height + deltaY;
        if (newHeight > 5 && y + newHeight <= 100) {
          height = newHeight;
        }
      }
      if (dragHandle.includes('w')) {
        const newX = x + deltaX;
        const newWidth = width - deltaX;
        if (newWidth > 5 && newX >= 0) {
          x = newX;
          width = newWidth;
        }
      }
      if (dragHandle.includes('e')) {
        const newWidth = width + deltaX;
        if (newWidth > 5 && x + newWidth <= 100) {
          width = newWidth;
        }
      }

      // Handle edge resizing
      if (dragHandle === 'n') {
        const newY = y + deltaY;
        const newHeight = height - deltaY;
        if (newHeight > 5 && newY >= 0) {
          y = newY;
          height = newHeight;
        }
      }
      if (dragHandle === 's') {
        const newHeight = height + deltaY;
        if (newHeight > 5 && y + newHeight <= 100) {
          height = newHeight;
        }
      }
      if (dragHandle === 'w') {
        const newX = x + deltaX;
        const newWidth = width - deltaX;
        if (newWidth > 5 && newX >= 0) {
          x = newX;
          width = newWidth;
        }
      }
      if (dragHandle === 'e') {
        const newWidth = width + deltaX;
        if (newWidth > 5 && x + newWidth <= 100) {
          width = newWidth;
        }
      }

      return {
        ...goal,
        region: { x, y, width, height },
      };
    });

    onGoalsUpdate(updatedGoals);
    setDragStart(pos);
  };

  const handleResizeEnd = () => {
    setIsDragging(false);
    setIsDraggingRegion(false);
    setDragHandle(null);
    setDragStart(null);
  };

  const deleteGoal = (goalId: string) => {
    onGoalsUpdate(goals.filter((g) => g.id !== goalId));
    setSelectedGoalId(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-[#141B2E] p-4 rounded-xl border border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('select')}
            className={`px-4 py-2 rounded-lg transition ${
              mode === 'select'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Select & Edit
          </button>
          <button
            onClick={() => setMode('draw')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              mode === 'draw'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            Draw New Goal
          </button>
        </div>
        
        {onSave && (
          <button
            onClick={onSave}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>

      {/* Instructions */}
      {mode === 'draw' && (
        <div className="bg-emerald-900/20 border border-emerald-600/30 p-3 rounded-lg">
          <p className="text-sm text-emerald-400">
            <strong>Draw Mode:</strong> Click and drag on the vision board to create a new goal region
          </p>
        </div>
      )}

      {mode === 'select' && (
        <div className="bg-blue-900/20 border border-blue-600/30 p-3 rounded-lg">
          <p className="text-sm text-blue-400">
            <strong>Select Mode:</strong> Click a goal region to select it. Drag the center to move it, or drag corners/edges to resize
          </p>
        </div>
      )}

      {/* Vision Board Editor */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-2xl cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Base Image */}
        <Image
          src={imageUrl}
          alt="Vision Board"
          fill
          className="object-cover pointer-events-none"
          draggable={false}
        />

        {/* Existing Goal Regions */}
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => mode === 'select' && setSelectedGoalId(goal.id)}
            onMouseDown={(e) => {
              if (mode === 'select' && selectedGoalId === goal.id) {
                handleRegionDragStart(goal.id, e);
              }
            }}
            className={`absolute border-2 transition-all ${
              selectedGoalId === goal.id
                ? 'border-blue-500 bg-blue-500/20'
                : 'border-white/50 bg-white/10 hover:border-white hover:bg-white/20'
            }`}
            style={{
              left: `${(goal.region || goal.region_coords)?.x}%`,
top: `${(goal.region || goal.region_coords)?.y}%`,
width: `${(goal.region || goal.region_coords)?.width}%`,
height: `${(goal.region || goal.region_coords)?.height}%`,
              cursor: mode === 'select' 
                ? selectedGoalId === goal.id 
                  ? 'move' 
                  : 'pointer' 
                : 'not-allowed',
            }}
          >
            {/* Goal Label */}
            <div className="absolute -top-8 left-0 bg-black/80 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
              {goal.title}
            </div>

            {/* Resize Handles (only show when selected) */}
            {selectedGoalId === goal.id && mode === 'select' && (
              <>
                {/* Corner Handles */}
                <div
                  onMouseDown={(e) => handleResizeStart(goal.id, 'nw', e)}
                  className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize z-10"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(goal.id, 'ne', e)}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize z-10"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(goal.id, 'sw', e)}
                  className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize z-10"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(goal.id, 'se', e)}
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize z-10"
                />

                {/* Edge Handles */}
                <div
                  onMouseDown={(e) => handleResizeStart(goal.id, 'n', e)}
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-blue-500 border border-white rounded cursor-n-resize z-10"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(goal.id, 's', e)}
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-blue-500 border border-white rounded cursor-s-resize z-10"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(goal.id, 'w', e)}
                  className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-6 bg-blue-500 border border-white rounded cursor-w-resize z-10"
                />
                <div
                  onMouseDown={(e) => handleResizeStart(goal.id, 'e', e)}
                  className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-6 bg-blue-500 border border-white rounded cursor-e-resize z-10"
                />

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGoal(goal.id);
                  }}
                  className="absolute -top-8 right-0 bg-red-600 hover:bg-red-500 p-1 rounded transition z-10"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </>
            )}
          </div>
        ))}

        {/* Currently Drawing Region */}
        {isDrawing && currentDraw && (
          <div
            className="absolute border-2 border-emerald-500 bg-emerald-500/20 pointer-events-none"
            style={{
              left: `${currentDraw.x}%`,
              top: `${currentDraw.y}%`,
              width: `${currentDraw.width}%`,
              height: `${currentDraw.height}%`,
            }}
          />
        )}
      </div>

      {/* New Goal Title Input Modal */}
      {showTitleInput && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#141B2E] p-6 rounded-xl border border-gray-800 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Name Your Goal</h3>
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="e.g., Health & Fitness"
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveNewGoal();
                if (e.key === 'Escape') cancelNewGoal();
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={cancelNewGoal}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={saveNewGoal}
                disabled={!newGoalTitle.trim()}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="bg-[#141B2E] p-4 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-3">
          Goals ({goals.length})
        </h3>
        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`p-3 rounded-lg cursor-pointer transition ${
                selectedGoalId === goal.id
                  ? 'bg-blue-600/20 border border-blue-500'
                  : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{goal.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteGoal(goal.id);
                  }}
                  className="p-1 hover:bg-red-600/20 rounded transition"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Position: {Math.round(goal.region.x)}%, {Math.round(goal.region.y)}% • 
                Size: {Math.round(goal.region.width)}% × {Math.round(goal.region.height)}%
              </div>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">
              No goals yet. Click "Draw New Goal" to add one!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
