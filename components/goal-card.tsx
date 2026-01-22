"use client"
import { ArrowRight } from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  created_at: string
}

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  return (
    <div className="group relative bg-card rounded-xl p-6 border border-border transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]">
      <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">{goal.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{goal.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Created {new Date(goal.created_at).toLocaleDateString()}
        </span>
        <button className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
          View Details
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
