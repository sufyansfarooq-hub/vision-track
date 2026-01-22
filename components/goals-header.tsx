"use client"
import { Button } from "@/components/ui/button"
import { BarChart3, CheckCircle2, Upload } from "lucide-react"
import Link from "next/link"

interface GoalsHeaderProps {
  goalsCount: number
}

export function GoalsHeader({ goalsCount }: GoalsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">My Goals</h1>
        <p className="text-muted-foreground">
          {goalsCount} {goalsCount === 1 ? "goal" : "goals"} tracked
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/progress">
          <Button
            variant="secondary"
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Progress
          </Button>
        </Link>
        <Link href="/check-in">
          <Button
            variant="secondary"
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Check-in
          </Button>
        </Link>
        <Link href="/upload">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </Link>
      </div>
    </header>
  )
}
