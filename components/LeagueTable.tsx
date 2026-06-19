"use client"

import { memo } from "react"
import { Search, Plus, Eye, Edit2, CheckCircle, Trash2, Trophy, Clock, MoreHorizontal } from 'lucide-react'
import type React from "react"
import type { LeagueData } from "../types"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LeagueTableProps {
  leagues: LeagueData[]
  onLeagueAction: (leagueId: string, action: "view" | "edit" | "complete" | "delete") => void
  onSearch: (term: string) => void
  onNewLeague: () => void
}

const ActionMenu = memo(
  ({
    onAction,
    leagueId,
    status,
    season
  }: {
    onAction: (leagueId: string, action: "view" | "edit" | "complete" | "delete") => void
    leagueId: string
    status: string
    season: string
  }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => onAction(leagueId, "view")}
            className="focus:bg-zinc-800 focus:text-white cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onAction(leagueId, "edit")}
            className="focus:bg-zinc-800 focus:text-white cursor-pointer"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit League
          </DropdownMenuItem>
          {status === "In Progress" && (
            <DropdownMenuItem 
              onClick={() => onAction(leagueId, "complete")}
              className="focus:bg-zinc-800 focus:text-emerald-400 cursor-pointer text-emerald-500"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Complete
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem 
            onClick={() => onAction(leagueId, "delete")}
            className="focus:bg-red-900/30 focus:text-red-400 cursor-pointer text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete League
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)

ActionMenu.displayName = "ActionMenu"

const SearchBar = memo(({ onSearch }: { onSearch: (term: string) => void }) => (
  <div className="relative w-full sm:w-80 group">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-400 transition-colors" />
    <input
      type="text"
      placeholder="Search leagues..."
      onChange={(e) => onSearch(e.target.value)}
      className="w-full bg-zinc-900/50 text-zinc-100 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5
                focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50
                transition-all duration-200 placeholder:text-zinc-600 hover:border-zinc-700"
      aria-label="Search leagues"
    />
  </div>
))

SearchBar.displayName = "SearchBar"

const StatusBadge = memo(({ status }: { status: string }) => {
  const isProgress = status === "In Progress"
  return (
    <span
      className={`
        px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border
        ${isProgress 
          ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}
      `}
    >
      {isProgress ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
      {status}
    </span>
  )
})

StatusBadge.displayName = "StatusBadge"

export const LeagueTable = memo(({ leagues, onLeagueAction, onSearch, onNewLeague }: LeagueTableProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar onSearch={onSearch} />
        <Button
          onClick={onNewLeague}
          className="bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white border-0
                     flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg shadow-brand-900/20 transition-all duration-200 rounded-xl h-11 px-6"
        >
          <Plus className="w-4 h-4" />
          New League
        </Button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-zinc-800/50 shadow-2xl bg-zinc-900/30 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium py-5 pl-6">Season</TableHead>
                <TableHead className="text-zinc-400 font-medium py-5">Winner</TableHead>
                <TableHead className="text-zinc-400 font-medium py-5">Second Place</TableHead>
                <TableHead className="text-zinc-400 font-medium py-5">Third Place</TableHead>
                <TableHead className="text-zinc-400 font-medium py-5">Status</TableHead>
                <TableHead className="text-zinc-400 font-medium py-5 pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leagues.map((league) => (
                <TableRow key={league.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
                  <TableCell className="font-medium py-5 pl-6 text-zinc-200 group-hover:text-white transition-colors">
                    {league.season}
                  </TableCell>
                  <TableCell className="py-5 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {league.winner || <span className="text-zinc-700">—</span>}
                  </TableCell>
                  <TableCell className="py-5 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {league.secondPlace || <span className="text-zinc-700">—</span>}
                  </TableCell>
                  <TableCell className="py-5 text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {league.thirdPlace || <span className="text-zinc-700">—</span>}
                  </TableCell>
                  <TableCell className="py-5">
                    <StatusBadge status={league.status} />
                  </TableCell>
                  <TableCell className="text-right py-5 pr-6">
                    <ActionMenu 
                      onAction={onLeagueAction} 
                      leagueId={league.id} 
                      status={league.status}
                      season={league.season}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {leagues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-4 justify-center h-full">
                      <div className="p-5 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner">
                        <Trophy className="w-10 h-10 text-zinc-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-zinc-300 font-medium text-lg">No leagues found</p>
                        <p className="text-sm text-zinc-500">Create your first league to get started!</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={onNewLeague}
                        className="mt-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      >
                        Create League
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
})

LeagueTable.displayName = "LeagueTable"
