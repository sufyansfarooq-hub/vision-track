interface Milestone {
  is_completed: boolean;
}

export function calculateProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) {
    return 0;
  }

  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  
  return Math.round((completedCount / totalCount) * 100);
}
