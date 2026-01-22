"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Filter, SortAsc } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Snapshot {
  id: string
  goalTitle: string
  percentage: number
  date: string
  milestonesCompleted: number
  totalMilestones: number
  imageUrl: string
}

const mockSnapshots: Snapshot[] = [
  {
    id: "1",
    goalTitle: "Learn Spanish",
    percentage: 75,
    date: "Jan 15, 2026",
    milestonesCompleted: 3,
    totalMilestones: 4,
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "2",
    goalTitle: "Run a Marathon",
    percentage: 50,
    date: "Jan 10, 2026",
    milestonesCompleted: 2,
    totalMilestones: 4,
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "3",
    goalTitle: "Read 24 Books",
    percentage: 100,
    date: "Jan 8, 2026",
    milestonesCompleted: 4,
    totalMilestones: 4,
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "4",
    goalTitle: "Save $10,000",
    percentage: 25,
    date: "Jan 5, 2026",
    milestonesCompleted: 1,
    totalMilestones: 4,
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "5",
    goalTitle: "Learn Piano",
    percentage: 50,
    date: "Jan 3, 2026",
    milestonesCompleted: 2,
    totalMilestones: 4,
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "6",
    goalTitle: "Write a Novel",
    percentage: 25,
    date: "Dec 28, 2025",
    milestonesCompleted: 1,
    totalMilestones: 4,
    imageUrl: "/placeholder.svg?height=400&width=600",
  },
]

function getMilestoneBadge(percentage: number) {
  if (percentage >= 100) {
    return { emoji: "🎉", text: "Completed!", glow: true }
  } else if (percentage >= 75) {
    return { emoji: "🌳", text: "Almost Done", glow: false }
  } else if (percentage >= 50) {
    return { emoji: "🌿", text: "Halfway There", glow: false }
  } else {
    return { emoji: "🌱", text: "Getting Started", glow: false }
  }
}

function SnapshotCard({ snapshot }: { snapshot: Snapshot }) {
  const badge = getMilestoneBadge(snapshot.percentage)

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
      {/* Card Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-foreground">{snapshot.goalTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{snapshot.date}</p>
          <p className="text-xs text-muted-foreground">
            {snapshot.milestonesCompleted}/{snapshot.totalMilestones} milestones
          </p>
        </div>
        <div className="text-5xl font-bold text-foreground">{snapshot.percentage}%</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-4 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000 ease-out"
          style={{ width: `${snapshot.percentage}%` }}
        />
      </div>

      {/* Vision Board Preview */}
      <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-secondary">
        <div
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-emerald-600/30"
          style={{ width: `${snapshot.percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-20">
            {badge.emoji}
          </span>
        </div>
      </div>

      {/* Milestone Badge */}
      <div className="mb-4 flex justify-center">
        <div
          className={`flex items-center gap-2 rounded-full border-2 border-emerald-500 bg-emerald-500/20 px-6 py-3 ${
            badge.glow ? "shadow-lg shadow-emerald-500/50" : ""
          }`}
        >
          <span className="text-xl">{badge.emoji}</span>
          <span className="font-medium text-foreground">{badge.text}</span>
        </div>
      </div>

      {/* View Details Link */}
      <div className="text-center">
        <Link
          href="/"
          className="text-primary transition-colors hover:underline"
        >
          View Goal Details &rarr;
        </Link>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="h-8 w-48 rounded bg-secondary" />
          <div className="mt-2 h-4 w-24 rounded bg-secondary" />
          <div className="mt-1 h-3 w-32 rounded bg-secondary" />
        </div>
        <div className="h-12 w-16 rounded bg-secondary" />
      </div>
      <div className="mb-6 h-4 w-full rounded-full bg-secondary" />
      <div className="mb-6 aspect-video w-full rounded-lg bg-secondary" />
      <div className="mb-4 flex justify-center">
        <div className="h-12 w-40 rounded-full bg-secondary" />
      </div>
      <div className="flex justify-center">
        <div className="h-5 w-32 rounded bg-secondary" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-8 text-[128px]">
        <Camera className="h-32 w-32 text-muted-foreground" />
      </div>
      <h2 className="mb-4 text-center text-4xl font-bold text-foreground">
        No snapshots yet!
      </h2>
      <p className="mb-8 max-w-md text-center text-muted-foreground">
        Complete milestones to capture progress at 25%, 50%, 75%, and 100%
      </p>
      <Link href="/">
        <Button className="bg-primary px-8 py-6 text-lg font-semibold text-primary-foreground hover:bg-primary/90">
          View Your Goals
        </Button>
      </Link>
    </div>
  )
}

export function ProgressGallery() {
  const [isLoading, setIsLoading] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)
  const [filterMilestone, setFilterMilestone] = useState<number | null>(null)
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  const filteredSnapshots = mockSnapshots
    .filter((s) => (filterMilestone ? s.percentage === filterMilestone : true))
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-5xl font-bold text-foreground">Progress Gallery</h1>
            <p className="mt-2 text-base text-muted-foreground">
              {filteredSnapshots.length} milestones captured
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
                >
                  <Filter className="h-4 w-4" />
                  {filterMilestone ? `${filterMilestone}%` : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border bg-card text-foreground">
                <DropdownMenuItem onClick={() => setFilterMilestone(null)}>
                  All Milestones
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMilestone(25)}>
                  25% - Getting Started
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMilestone(50)}>
                  50% - Halfway There
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMilestone(75)}>
                  75% - Almost Done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterMilestone(100)}>
                  100% - Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
                >
                  <SortAsc className="h-4 w-4" />
                  {sortOrder === "newest" ? "Newest" : "Oldest"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-border bg-card text-foreground">
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Toggle Empty State (for demo) */}
            <Button
              variant="outline"
              className="border-border bg-transparent text-foreground hover:bg-secondary"
              onClick={() => setShowEmpty(!showEmpty)}
            >
              {showEmpty ? "Show Gallery" : "Show Empty"}
            </Button>

            {/* Back to Goals */}
            <Link href="/">
              <Button
                variant="outline"
                className="gap-2 border-border bg-transparent text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Goals
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {showEmpty ? (
          <EmptyState />
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSnapshots.map((snapshot) => (
              <SnapshotCard key={snapshot.id} snapshot={snapshot} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

