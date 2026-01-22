'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

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

interface MultiRegionColorFillProps {
  imageUrl: string;
  goals: Goal[];
}

export function MultiRegionColorFill({ imageUrl, goals }: MultiRegionColorFillProps) {
  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-2xl">
      {/* Base greyscale image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt="Vision Board"
          fill
          className="object-cover"
          style={{ filter: 'grayscale(100%) brightness(0.5)' }}
          priority
        />
      </div>

      {/* Colored regions */}
      {goals.map((goal) => (
        <GoalRegion key={goal.id} imageUrl={imageUrl} goal={goal} />
      ))}

      {/* UI overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="absolute"
            style={{
              left: `${goal.region.x}%`,
              top: `${goal.region.y}%`,
              width: `${goal.region.width}%`,
              height: `${goal.region.height}%`,
            }}
          >
            <div className="relative w-full h-full border-2 border-white/30 rounded-lg">
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-bold">
                {goal.progress}%
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-medium truncate">
                {goal.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalRegion({ imageUrl, goal }: { imageUrl: string; goal: Goal }) {
  const { region, progress } = goal;

  // Calculate the clip-path coordinates in absolute image percentages
  const top = region.y + (region.height * (100 - progress) / 100);
  const right = 100 - (region.x + region.width);
  const bottom = 100 - (region.y + region.height);
  const left = region.x;

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ 
        clipPath: `inset(${region.y + region.height}% ${right}% ${bottom}% ${left}%)` 
      }}
      animate={{ 
        clipPath: `inset(${top}% ${right}% ${bottom}% ${left}%)` 
      }}
      transition={{
        duration: 1.2,
        ease: [0.43, 0.13, 0.23, 0.96],
      }}
    >
      <Image
        src={imageUrl}
        alt={goal.title}
        fill
        className="object-cover"
        priority
      />
    </motion.div>
  );
}
