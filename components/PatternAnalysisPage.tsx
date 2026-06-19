"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash, BarChart, Lightbulb, Play, Loader2, Info, CalendarDays } from "lucide-react"
import type { PatternDefinition, PatternCondition, AnalysisJob, AnalysisFilter } from "../analysis/types"
import type { Match, LeagueData } from "../types"
import type { EnhancedPatternAnalysisService } from "../analysis/enhanced-pattern-analysis-service"
import { AnalysisResultsPanel } from "./AnalysisResultsPanel"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/custom-calendar"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

interface PatternAnalysisPageProps {
  matches: Match[]
  leagues: LeagueData[]
  patternAnalysisService: EnhancedPatternAnalysisService
  patternDefinitions: PatternDefinition[]
  analysisJobs: AnalysisJob[]
  onAddPattern: (pattern: PatternDefinition) => void
  onUpdatePattern: (pattern: PatternDefinition) => void
  onDeletePattern: (patternId: string) => void
  onRunAnalysisJob: (job: AnalysisJob) => void
}

export function PatternAnalysisPage({
  matches,
  leagues,
  patternAnalysisService,
  patternDefinitions,
  analysisJobs,
  onAddPattern,
  onUpdatePattern,
  onDeletePattern,
  onRunAnalysisJob,
}: PatternAnalysisPageProps) {
  const { toast } = useToast()
  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false)
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null)
  const [newPattern, setNewPattern] = useState<Partial<PatternDefinition>>({
    name: "",
    description: "",
    conditions: [],
  })
  const [activeTab, setActiveTab] = useState("definitions")
  const [analysisFilter, setAnalysisFilter] = useState<AnalysisFilter>({})
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const resetNewPatternForm = useCallback(() => {
    setNewPattern({ name: "", description: "", conditions: [] })
    setEditingPatternId(null)
  }, [])

  const handleAddPattern = useCallback(() => {
    if (!newPattern.name || !newPattern.description || (newPattern.conditions || []).length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all pattern details and add at least one condition.",
        variant: "destructive",
      })
      return
    }

    const pattern: PatternDefinition = {
      id: `pattern-${Date.now()}`,
      name: newPattern.name,
      description: newPattern.description,
      conditions: newPattern.conditions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onAddPattern(pattern)
    setIsPatternModalOpen(false)
    resetNewPatternForm()
    toast({
      title: "Pattern Added",
      description: `Pattern "${pattern.name}" has been successfully added.`,
    })
  }, [newPattern, onAddPattern, resetNewPatternForm, toast])

  const handleEditPattern = useCallback((pattern: PatternDefinition) => {
    setEditingPatternId(pattern.id)
    setNewPattern({
      name: pattern.name,
      description: pattern.description,
      conditions: pattern.conditions,
    })
    setIsPatternModalOpen(true)
  }, [])

  const handleUpdatePattern = useCallback(() => {
    if (
      !editingPatternId ||
      !newPattern.name ||
      !newPattern.description ||
      (newPattern.conditions || []).length === 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all pattern details and add at least one condition.",
        variant: "destructive",
      })
      return
    }

    const updatedPattern: PatternDefinition = {
      id: editingPatternId,
      name: newPattern.name,
      description: newPattern.description,
      conditions: newPattern.conditions || [],
      createdAt: patternDefinitions.find((p) => p.id === editingPatternId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onUpdatePattern(updatedPattern)
    setIsPatternModalOpen(false)
    resetNewPatternForm()
    toast({
      title: "Pattern Updated",
      description: `Pattern "${updatedPattern.name}" has been successfully updated.`,
    })
  }, [editingPatternId, newPattern, onUpdatePattern, patternDefinitions, resetNewPatternForm, toast])

  const handleDeletePattern = useCallback(
    (patternId: string) => {
      onDeletePattern(patternId)
      toast({
        title: "Pattern Deleted",
        description: "The pattern has been successfully deleted.",
      })
    },
    [onDeletePattern, toast],
  )

  const handleAddCondition = useCallback(() => {
    setNewPattern((prev) => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        {
          id: `cond-${Date.now()}`,
          type: "custom", // Default to custom for flexibility
          operator: "=",
          value: "",
          customFormula: "",
        },
      ],
    }))
  }, [])

  const handleUpdateCondition = useCallback((index: number, field: keyof PatternCondition, value: any) => {
    setNewPattern((prev) => {
      const updatedConditions = [...(prev.conditions || [])]
      updatedConditions[index] = {
        ...updatedConditions[index],
        [field]: value,
      }
      return { ...prev, conditions: updatedConditions }
    })
  }, [])

  const handleRemoveCondition = useCallback((index: number) => {
    setNewPattern((prev) => {
      const updatedConditions = [...(prev.conditions || [])]
      updatedConditions.splice(index, 1)
      return { ...prev, conditions: updatedConditions }
    })
  }, [])

  const handleRunAnalysis = useCallback(
    async (patternId: string) => {
      const pattern = patternDefinitions.find((p) => p.id === patternId)
      if (!pattern) {
        toast({
          title: "Error",
          description: "Pattern not found for analysis.",
          variant: "destructive",
        })
        return
      }

      const job: AnalysisJob = {
        id: `job-${Date.now()}`,
        dataSourceId: "current-league-matches", // Placeholder
        patternIds: [patternId],
        status: "pending",
        progress: 0,
      }
      onRunAnalysisJob(job)
      setActiveTab("results")
      toast({
        title: "Analysis Started",
        description: `Running analysis for pattern "${pattern.name}".`,
      })
    },
    [patternDefinitions, onRunAnalysisJob, toast],
  )

  const handleDiscoverPatterns = useCallback(async () => {
    toast({
      title: "Discovering Patterns",
      description: "Running ML model to discover new patterns...",
    })
    try {
      const discovered = await patternAnalysisService.discoverPatterns(matches, leagues, analysisFilter)
      discovered.forEach((p) => onAddPattern(p))
      toast({
        title: "Patterns Discovered",
        description: `Found ${discovered.length} new patterns.`,
      })
    } catch (error) {
      console.error("Error discovering patterns:", error)
      toast({
        title: "Pattern Discovery Failed",
        description: "Could not discover patterns. See console for details.",
        variant: "destructive",
      })
    }
  }, [matches, leagues, analysisFilter, patternAnalysisService, onAddPattern, toast])

  const currentAnalysisResult = useMemo(() => {
    const latestJob = analysisJobs
      .filter((job) => job.status === "completed" && job.results)
      .sort((a, b) => new Date(b.endTime || 0).getTime() - new Date(a.endTime || 0).getTime())[0]

    if (latestJob && latestJob.results) {
      const patternId = Object.keys(latestJob.results)[0]
      return latestJob.results[patternId]
    }
    return null
  }, [analysisJobs])

  const handleFilterChange = useCallback((key: keyof AnalysisFilter, value: any) => {
    setAnalysisFilter((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      setDateRange(range)
      if (range?.from && range?.to) {
        handleFilterChange("dateRange", [range.from.toISOString(), range.to.toISOString()])
      } else {
        handleFilterChange("dateRange", undefined)
      }
    },
    [handleFilterChange],
  )

  const commonSeasons = useMemo(() => {
    const allSeasons = new Set<string>()
    matches.forEach((m) => {
      // Assuming match.date can be used to infer season, or if matches have a 'season' property
      // For now, let's use league seasons
      const leagueSeason = leagues.find((l) => l.name === m.league)?.season
      if (leagueSeason) allSeasons.add(leagueSeason)
    })
    return Array.from(allSeasons).sort()
  }, [matches, leagues])

  const commonTeams = useMemo(() => {
    const allTeams = new Set<string>()
    matches.forEach((m) => {
      allTeams.add(m.home_team)
      allTeams.add(m.away_team)
    })
    return Array.from(allTeams).sort()
  }, [matches])

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/5">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-500" /> Pattern Analysis
          </CardTitle>
          <CardDescription className="text-gray-400">
            Define, analyze, and discover patterns in your soccer match data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filter-teams" className="text-gray-300">
                Filter by Teams
              </Label>
              <Select
                value={analysisFilter.teams?.[0] || ""}
                onValueChange={(value) => handleFilterChange("teams", value === "all" ? undefined : [value])}
              >
                <SelectTrigger id="filter-teams" className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f14] border-white/10">
                  <SelectItem value="all">All Teams</SelectItem>
                  {commonTeams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-seasons" className="text-gray-300">
                Filter by Seasons
              </Label>
              <Select
                value={analysisFilter.seasons?.[0] || ""}
                onValueChange={(value) => handleFilterChange("seasons", value === "all" ? undefined : [value])}
              >
                <SelectTrigger id="filter-seasons" className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f14] border-white/10">
                  <SelectItem value="all">All Seasons</SelectItem>
                  {commonSeasons.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-date-range" className="text-gray-300">
                Filter by Date Range
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="filter-date-range"
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal bg-black/30 border-white/10 text-white"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#0a0f14] border-white/10 text-white" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleDiscoverPatterns} className="gap-2 bg-purple-500 hover:bg-purple-600 text-white">
              <Lightbulb className="h-4 w-4" /> Discover Patterns (ML)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-white/10">
          <TabsTrigger value="definitions" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Info className="h-4 w-4 mr-2" /> Pattern Definitions
          </TabsTrigger>
          <TabsTrigger value="results" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart className="h-4 w-4 mr-2" /> Analysis Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="definitions" className="mt-6">
          <Card className="bg-black/20 border-white/5">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-white">Your Patterns</CardTitle>
              <Dialog open={isPatternModalOpen} onOpenChange={setIsPatternModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetNewPatternForm} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Pattern
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-[#0a0f14] border border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingPatternId ? "Edit Pattern" : "Create New Pattern"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Define the rules for your soccer match pattern.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="pattern-name" className="text-gray-300">
                        Pattern Name
                      </Label>
                      <Input
                        id="pattern-name"
                        value={newPattern.name || ""}
                        onChange={(e) => setNewPattern((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Late Game Comeback"
                        className="bg-black/30 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pattern-description" className="text-gray-300">
                        Description
                      </Label>
                      <Textarea
                        id="pattern-description"
                        value={newPattern.description || ""}
                        onChange={(e) => setNewPattern((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this pattern signifies."
                        className="bg-black/30 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-gray-300">Conditions</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddCondition}
                          className="gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          <Plus className="w-3 h-3" /> Add Condition
                        </Button>
                      </div>
                      {(newPattern.conditions || []).length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          No conditions defined. Add a condition to define your pattern.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(newPattern.conditions || []).map((condition, index) => (
                            <Card key={condition.id || index} className="bg-black/30 border-white/10 p-3">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-white">Condition {index + 1}</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveCondition(index)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`cond-type-${index}`} className="text-gray-400">
                                    Type
                                  </Label>
                                  <Select
                                    value={condition.type}
                                    onValueChange={(value) =>
                                      handleUpdateCondition(index, "type", value as PatternCondition["type"])
                                    }
                                  >
                                    <SelectTrigger id={`cond-type-${index}`} className="bg-black/40 border-white/10">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0f14] border-white/10">
                                      <SelectItem value="halftime_score">Halftime Score</SelectItem>
                                      <SelectItem value="fulltime_score">Fulltime Score</SelectItem>
                                      <SelectItem value="score_change">Score Change</SelectItem>
                                      <SelectItem value="team_performance">Team Performance</SelectItem>
                                      <SelectItem value="custom">Custom Formula</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor={`cond-operator-${index}`} className="text-gray-400">
                                    Operator
                                  </Label>
                                  <Select
                                    value={condition.operator}
                                    onValueChange={(value) =>
                                      handleUpdateCondition(index, "operator", value as PatternCondition["operator"])
                                    }
                                  >
                                    <SelectTrigger
                                      id={`cond-operator-${index}`}
                                      className="bg-black/40 border-white/10"
                                    >
                                      <SelectValue placeholder="Select operator" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0f14] border-white/10">
                                      <SelectItem value="=">=</SelectItem>
                                      <SelectItem value="!=">!=</SelectItem>
                                      <SelectItem value=">">{">"}</SelectItem>
                                      <SelectItem value="<">{"<"}</SelectItem>
                                      <SelectItem value=">=">{"≥"}</SelectItem>
                                      <SelectItem value="<=">{"≤"}</SelectItem>
                                      {condition.type === "custom" && (
                                        <>
                                          <SelectItem value="between">Between</SelectItem>
                                          <SelectItem value="contains">Contains</SelectItem>
                                        </>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                                {condition.type !== "custom" && (
                                  <div>
                                    <Label htmlFor={`cond-value-${index}`} className="text-gray-400">
                                      Value
                                    </Label>
                                    <Input
                                      id={`cond-value-${index}`}
                                      type="text"
                                      value={condition.value || ""}
                                      onChange={(e) => handleUpdateCondition(index, "value", e.target.value)}
                                      placeholder="e.g., 2, 1-1, turnaround"
                                      className="bg-black/40 border-white/10"
                                    />
                                  </div>
                                )}
                                {(condition.type === "halftime_score" ||
                                  condition.type === "fulltime_score" ||
                                  condition.type === "score_change") && (
                                  <div>
                                    <Label htmlFor={`cond-target-${index}`} className="text-gray-400">
                                      Target
                                    </Label>
                                    <Select
                                      value={condition.target || "both"}
                                      onValueChange={(value) =>
                                        handleUpdateCondition(index, "target", value as PatternCondition["target"])
                                      }
                                    >
                                      <SelectTrigger
                                        id={`cond-target-${index}`}
                                        className="bg-black/40 border-white/10"
                                      >
                                        <SelectValue placeholder="Select target" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-[#0a0f14] border-white/10">
                                        <SelectItem value="home">Home Team</SelectItem>
                                        <SelectItem value="away">Away Team</SelectItem>
                                        <SelectItem value="both">Both Teams</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                                {condition.type === "custom" && (
                                  <div className="col-span-full">
                                    <Label htmlFor={`cond-formula-${index}`} className="text-gray-400">
                                      Custom Formula (JS)
                                    </Label>
                                    <Textarea
                                      id={`cond-formula-${index}`}
                                      value={condition.customFormula || ""}
                                      onChange={(e) => handleUpdateCondition(index, "customFormula", e.target.value)}
                                      placeholder="e.g., (ft_home + ft_away) > 3"
                                      className="bg-black/40 border-white/10 font-mono"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                      Available variables: `ht_home`, `ht_away`, `ft_home`, `ft_away`, `home_change`,
                                      `away_change`.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsPatternModalOpen(false)}
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingPatternId ? handleUpdatePattern : handleAddPattern}
                      className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {editingPatternId ? "Save Changes" : "Create Pattern"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {patternDefinitions.length === 0 ? (
                <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
                  <h3 className="text-lg font-medium mb-2">No Patterns Defined</h3>
                  <p className="text-gray-400 mb-4">Start by creating your first pattern to analyze match data.</p>
                  <Button onClick={() => setIsPatternModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pattern
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patternDefinitions.map((pattern) => (
                    <Card key={pattern.id} className="bg-black/20 border border-white/10">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center text-white">
                          {pattern.name}
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPattern(pattern)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePattern(pattern.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardTitle>
                        <CardDescription className="text-gray-400 line-clamp-2">{pattern.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-gray-300">
                          <span className="font-medium">Conditions:</span>
                          <ul className="list-disc list-inside text-xs text-gray-400">
                            {pattern.conditions.map((cond, idx) => (
                              <li key={idx}>
                                {cond.type === "custom"
                                  ? `Custom: ${cond.customFormula}`
                                  : `${cond.type} ${cond.operator} ${cond.value}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button
                          onClick={() => handleRunAnalysis(pattern.id)}
                          className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                          disabled={analysisJobs.some(
                            (job) => job.patternIds.includes(pattern.id) && job.status === "running",
                          )}
                        >
                          {analysisJobs.some(
                            (job) => job.patternIds.includes(pattern.id) && job.status === "running",
                          ) ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" /> Run Analysis
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <AnalysisResultsPanel
            analysisResults={currentAnalysisResult ? [currentAnalysisResult] : []}
            analysisJobs={analysisJobs}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
