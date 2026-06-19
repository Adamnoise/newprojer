"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CSVError } from "../types/csv.types"
import { cn } from "@/lib/utils"

interface ErrorListProps {
  errors: CSVError[]
  type: "error" | "warning"
}

export function ErrorList({ errors, type }: ErrorListProps) {
  const [expanded, setExpanded] = useState(false)

  const displayErrors = expanded ? errors : errors.slice(0, 5) // Show first 5 by default

  const icon = type === "error" ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />
  const textColor = type === "error" ? "text-red-400" : "text-amber-400"
  const bgColor = type === "error" ? "bg-red-900/10" : "bg-amber-900/10"
  const borderColor = type === "error" ? "border-red-800/30" : "border-amber-800/30"

  return (
    <div className={cn("rounded-md border", borderColor, bgColor)}>
      <ul className="divide-y divide-white/10">
        {displayErrors.map((error, index) => (
          <li key={index} className="p-3 flex items-start gap-3">
            <span className={cn("flex-shrink-0", textColor)}>{icon}</span>
            <div className="flex-1 text-sm text-gray-300">
              <p className="font-medium">{error.message}</p>
              {error.row !== -1 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Row: {error.row} | Code: {error.code}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {errors.length > 5 && (
        <div className="p-2 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="w-full text-blue-400 hover:bg-blue-500/10"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" /> Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" /> Show All ({errors.length - 5} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
