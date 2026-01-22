"use client";

import React from "react"

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cloud, Check, AlertCircle, RotateCcw, ArrowRight, Upload, Loader2 } from "lucide-react";

type UploadState = "idle" | "dragging" | "processing" | "results" | "success" | "error";

interface DetectedGoal {
  id: string;
  title: string;
  description: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
}

const GOAL_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const mockDetectedGoals: DetectedGoal[] = [
  {
    id: "1",
    title: "Financial Freedom",
    description: "Achieve financial independence through investments and savings",
    coordinates: { x: 5, y: 5, width: 28, height: 30 },
    color: GOAL_COLORS[0],
  },
  {
    id: "2",
    title: "Health & Fitness",
    description: "Maintain a healthy lifestyle with regular exercise and nutrition",
    coordinates: { x: 35, y: 8, width: 30, height: 25 },
    color: GOAL_COLORS[1],
  },
  {
    id: "3",
    title: "Travel Adventures",
    description: "Explore new destinations and experience different cultures",
    coordinates: { x: 67, y: 5, width: 28, height: 30 },
    color: GOAL_COLORS[2],
  },
  {
    id: "4",
    title: "Career Growth",
    description: "Advance professional skills and reach leadership positions",
    coordinates: { x: 8, y: 55, width: 35, height: 35 },
    color: GOAL_COLORS[3],
  },
  {
    id: "5",
    title: "Family & Relationships",
    description: "Nurture meaningful connections with loved ones",
    coordinates: { x: 50, y: 50, width: 42, height: 40 },
    color: GOAL_COLORS[4],
  },
];

export function VisionBoardUpload() {
  const [state, setState] = useState<UploadState>("idle");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [goals, setGoals] = useState<DetectedGoal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
  }, []);

  const validateFile = (file: File): string | null => {
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return "Unsupported format. Please upload PNG, JPG, or WEBP files.";
    }
    if (file.size > maxSize) {
      return "File too large. Maximum size is 10MB.";
    }
    return null;
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setState("error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      setUploadedImage(e.target?.result as string);
      setState("processing");

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setGoals(mockDetectedGoals);
      setState("results");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const updateGoalCoordinate = (
    goalId: string,
    field: keyof DetectedGoal["coordinates"],
    value: number
  ) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              coordinates: {
                ...goal.coordinates,
                [field]: Math.min(100, Math.max(0, value)),
              },
            }
          : goal
      )
    );
  };

  const resetGoalCoordinates = (goalId: string) => {
    const originalGoal = mockDetectedGoals.find((g) => g.id === goalId);
    if (originalGoal) {
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? { ...goal, coordinates: { ...originalGoal.coordinates } }
            : goal
        )
      );
    }
  };

  const handleSave = async () => {
    setState("processing");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setState("success");
  };

  const handleReset = () => {
    setState("idle");
    setUploadedImage(null);
    setGoals([]);
    setError(null);
  };

  // Progress Steps
  const ProgressSteps = () => {
    const steps = ["Upload", "AI Analyze", "Review", "Save"];
    const currentStep =
      state === "idle" || state === "dragging"
        ? 0
        : state === "processing" && !goals.length
          ? 1
          : state === "results"
            ? 2
            : state === "success"
              ? 3
              : 0;

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index <= currentStep
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`ml-2 text-sm ${
                index <= currentStep ? "text-white" : "text-gray-500"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-3 ${
                  index < currentStep ? "bg-blue-500" : "bg-gray-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Idle/Dragging State - Upload Zone
  const UploadZone = () => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleUploadClick}
      className={`relative min-h-[400px] rounded-2xl border-3 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
        state === "dragging"
          ? "border-blue-500 bg-blue-500/10 border-solid"
          : "border-gray-600 hover:border-blue-500"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Cloud
        className={`w-24 h-24 text-gray-500 mb-6 transition-transform duration-300 ${
          state === "dragging" ? "scale-110 text-blue-500" : ""
        }`}
      />
      <p className="text-xl text-white mb-2">Click to upload or drag and drop</p>
      <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB</p>
    </div>
  );

  // Processing State
  const ProcessingState = () => (
    <div className="relative">
      {uploadedImage && (
        <div className="relative rounded-xl overflow-hidden">
          <img
            src={uploadedImage || "/placeholder.svg"}
            alt="Uploaded vision board"
            className="w-full max-h-[500px] object-contain"
          />
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-white text-lg mb-2">
              AI is analyzing your vision board
              <span className="animate-pulse">...</span>
            </p>
            <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Results State
  const ResultsState = () => (
    <div className="space-y-8">
      {/* Image with overlays */}
      <div className="relative rounded-xl overflow-hidden">
        {uploadedImage && (
          <img
            src={uploadedImage || "/placeholder.svg"}
            alt="Uploaded vision board"
            className="w-full max-h-[500px] object-contain bg-gray-900"
          />
        )}
        {/* Region overlays */}
        <div className="absolute inset-0">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="absolute border-2 rounded transition-all duration-300"
              style={{
                left: `${goal.coordinates.x}%`,
                top: `${goal.coordinates.y}%`,
                width: `${goal.coordinates.width}%`,
                height: `${goal.coordinates.height}%`,
                borderColor: goal.color,
                backgroundColor: `${goal.color}20`,
              }}
            >
              <span
                className="absolute -top-6 left-0 text-xs px-2 py-1 rounded text-white"
                style={{ backgroundColor: goal.color }}
              >
                {goal.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detected Goals Heading */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Detected Goals & Regions
        </h2>
        <p className="text-gray-400">Adjust coordinates if needed</p>
      </div>

      {/* Goal Cards */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-[#1F2937] p-6 rounded-xl"
            style={{ borderLeft: `4px solid ${goal.color}` }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{goal.title}</h3>
                <p className="text-sm text-gray-400">{goal.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetGoalCoordinates(goal.id)}
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 shrink-0"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset AI Values
              </Button>
            </div>

            {/* Coordinate Inputs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "X Position (%)", field: "x" as const },
                { label: "Y Position (%)", field: "y" as const },
                { label: "Width (%)", field: "width" as const },
                { label: "Height (%)", field: "height" as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs text-gray-400 mb-1">
                    {label}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={goal.coordinates[field]}
                    onChange={(e) =>
                      updateGoalCoordinate(
                        goal.id,
                        field,
                        Number(e.target.value)
                      )
                    }
                    className="bg-[#374151] border-0 text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Different Image
        </Button>
        <Button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          Save Goals to Database
        </Button>
      </div>
    </div>
  );

  // Success State
  const SuccessState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
        <Check className="w-8 h-8 text-emerald-500" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">
        Goals saved successfully!
      </h2>
      <p className="text-gray-400 mb-8">{goals.length} goals extracted and saved</p>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleReset}
          className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Upload Another
        </Button>
        <Button
          asChild
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <a href="/">
            View your goals
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );

  // Error State
  const ErrorState = () => (
    <div className="space-y-6">
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-red-400 font-medium">{error}</p>
          <p className="text-gray-400 text-sm mt-1">
            Supported formats: PNG, JPG, WEBP (max 10MB)
          </p>
        </div>
      </div>
      <Button
        onClick={handleReset}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0E1A] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Upload Vision Board
          </h1>
          <p className="text-lg text-gray-400">
            Let AI extract your goals from your vision board
          </p>
        </div>

        {/* Progress Steps */}
        {state !== "error" && <ProgressSteps />}

        {/* Content based on state */}
        {(state === "idle" || state === "dragging") && <UploadZone />}
        {state === "processing" && <ProcessingState />}
        {state === "results" && <ResultsState />}
        {state === "success" && <SuccessState />}
        {state === "error" && <ErrorState />}
      </div>

      {/* Custom animation for indeterminate progress */}
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
            width: 50%;
          }
          50% {
            transform: translateX(50%);
            width: 50%;
          }
          100% {
            transform: translateX(200%);
            width: 50%;
          }
        }
      `}</style>
    </div>
  );
}

