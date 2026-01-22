"use client";

import { useState, useEffect } from "react";
import { X, Plus, HelpCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Goal {
  id: string;
  title: string;
  progress: number;
}

interface QuickProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal;
  onSave?: (update: {
    goalId: string;
    type: "progress" | "help" | "on-track";
    note?: string;
  }) => void;
}

export function QuickProgressModal({
  isOpen,
  onClose,
  goal,
  onSave,
}: QuickProgressModalProps) {
  const [selectedOption, setSelectedOption] = useState<
    "progress" | "help" | "on-track" | null
  >(null);
  const [note, setNote] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedOption(null);
      setNote("");
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleSave = () => {
    if (selectedOption) {
      onSave?.({
        goalId: goal.id,
        type: selectedOption,
        note: note || undefined,
      });
    }
    setShowToast(true);
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Toast Notification */}
      <div
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${
          showToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span className="font-medium">Progress updated!</span>
        </div>
      </div>

      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal Card */}
        <div
          className={`relative w-full max-w-[500px] bg-[#1F2937] rounded-3xl p-6 shadow-2xl transition-all duration-200 ${
            isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">
              Quick Progress Update
            </h2>
            <p className="text-gray-400 text-sm">How's this goal going?</p>
          </div>

          {/* Goal Summary */}
          <div className="bg-[#111827] rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-white">{goal.title}</h3>
              <span className="text-2xl font-bold text-white">
                {goal.progress}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>

          {/* Quick Update Options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setSelectedOption("progress")}
              className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                selectedOption === "progress"
                  ? "bg-emerald-500 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#1F2937]"
                  : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              }`}
              type="button"
            >
              <Plus className="w-5 h-5" />
              Made Progress
            </button>
            <button
              onClick={() => setSelectedOption("help")}
              className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                selectedOption === "help"
                  ? "bg-orange-500 text-white ring-2 ring-orange-400 ring-offset-2 ring-offset-[#1F2937]"
                  : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"
              }`}
              type="button"
            >
              <HelpCircle className="w-5 h-5" />
              Need Help
            </button>
            <button
              onClick={() => setSelectedOption("on-track")}
              className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                selectedOption === "on-track"
                  ? "bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-[#1F2937]"
                  : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              }`}
              type="button"
            >
              <Check className="w-5 h-5" />
              On Track
            </button>
          </div>

          {/* Optional Note */}
          <div className="mb-6">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any updates to share?"
              rows={3}
              className="w-full bg-[#111827] text-white placeholder-gray-500 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-11 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white order-2 sm:order-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedOption}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              Save Update
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Demo wrapper component
export function QuickProgressModalDemo() {
  const [isOpen, setIsOpen] = useState(false);

  const sampleGoal = {
    id: "1",
    title: "Learn Spanish to conversational level",
    progress: 65,
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Open Quick Progress Modal
      </Button>
      <QuickProgressModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        goal={sampleGoal}
        onSave={(update) => console.log("Update saved:", update)}
      />
    </div>
  );
}

