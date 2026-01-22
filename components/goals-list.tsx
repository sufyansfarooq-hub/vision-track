"use client"
import { GoalCard } from "./goal-card"
import Link from "next/link"

interface Goal {
  id: string
  title: string
  description: string
  created_at: string
}

interface GoalsListProps {
  goals: Goal[]
}

export function GoalsList({ goals }: GoalsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {goals.map((goal) => (
        <Link key={goal.id} href={`/goals/${goal.id}`}>
          <GoalCard goal={goal} />
        </Link>
      ))}
    </div>
  )
}
