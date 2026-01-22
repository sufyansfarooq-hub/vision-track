"use client"
import { ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function GoalsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="rounded-full bg-card p-4 mb-6">
        <ClipboardCheck className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">No goals yet!</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-sm">
        Upload your first vision board to get started
      </p>
      <Link href="/upload">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8">
          Upload Vision Board
        </Button>
      </Link>
    </div>
  )
}
