"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Edit, Trash, Save, X } from "lucide-react"
import type { PatternDefinition, PatternCondition } from "../analysis/types"

interface PatternDefinitionPanelProps {
  patterns: PatternDefinition[]
  onAddPattern: (pattern: PatternDefinition) => void
  onUpdatePattern: (pattern: PatternDefinition) => void
  onDeletePattern: (patternId: string) => void
}

export function PatternDefinitionPanel({
  patterns,
  onAddPattern,
  onUpdatePattern,
  onDeletePattern,
}: PatternDefinitionPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null)
  const [newPattern, setNewPattern] = useState<Partial<PatternDefinition>>({
    name: "",
    description: "",
    conditions: [],
  })

  // Reset new pattern form
  const resetNewPatternForm = () => {
    setNewPattern({
      name: "",
      description: "",
      conditions: [],
    })
  }

  // Handle adding a new pattern
  const handleAddPattern = () => {
    if (!newPattern.name) return

    const pattern: PatternDefinition = {
      id: `pattern-${Date.now()}`,
      name: newPattern.name || "Unnamed Pattern",
      description: newPattern.description || "",
      conditions: newPattern.conditions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onAddPattern(pattern)
    setIsAddDialogOpen(false)
    resetNewPatternForm()
  }

  // Handle editing a pattern
  const handleEditPattern = (pattern: PatternDefinition) => {
    setEditingPatternId(pattern.id)
    setNewPattern({
      name: pattern.name,
      description: pattern.description,
      conditions: pattern.conditions,
    })
  }

  // Handle updating a pattern
  const handleUpdatePattern = () => {
    if (!editingPatternId || !newPattern.name) return

    const updatedPattern: PatternDefinition = {
      id: editingPatternId,
      name: newPattern.name,
      description: newPattern.description || "",
      conditions: newPattern.conditions || [],
      createdAt: patterns.find((p) => p.id === editingPatternId)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onUpdatePattern(updatedPattern)
    setEditingPatternId(null)
    resetNewPatternForm()
  }

  // Handle adding a condition to the pattern
  const handleAddCondition = () => {
    const newCondition: PatternCondition = {
      id: `condition-${Date.now()}`,
      type: "halftime_score",
      operator: "=",
      value: "",
    }

    setNewPattern((prev) => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition],
    }))
  }

  // Handle updating a condition
  const handleUpdateCondition = (index: number, field: keyof PatternCondition, value: any) => {
    setNewPattern((prev) => {
      const updatedConditions = [...(prev.conditions || [])]
      updatedConditions[index] = {
        ...updatedConditions[index],
        [field]: value,
      }

      return {
        ...prev,
        conditions: updatedConditions,
      }
    })
  }

  // Handle removing a condition
  const handleRemoveCondition = (index: number) => {
    setNewPattern((prev) => {
      const updatedConditions = [...(prev.conditions || [])]
      updatedConditions.splice(index, 1)

      return {
        ...prev,
        conditions: updatedConditions,
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pattern Definitions</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Pattern
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0f14] border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add New Pattern</DialogTitle>
              <DialogDescription>Define a new pattern to detect in match data</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pattern-name">Pattern Name</Label>
                <Input
                  id="pattern-name"
                  value={newPattern.name || ""}
                  onChange={(e) => setNewPattern((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Half-Time / Full-Time Turnaround"
                  className="bg-black/30 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern-description">Description</Label>
                <Textarea
                  id="pattern-description"
                  value={newPattern.description || ""}
                  onChange={(e) => setNewPattern((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this pattern represents"
                  className="bg-black/30 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Conditions</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddCondition}
                    className="gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>

                {(newPattern.conditions || []).length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No conditions defined. Add a condition to define the pattern.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(newPattern.conditions || []).map((condition, index) => (
                      <div key={condition.id} className="p-3 border border-white/10 rounded-md bg-black/20">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Condition {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCondition(index)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`condition-${index}-type`}>Type</Label>
                            <Select
                              value={condition.type}
                              onValueChange={(value) => handleUpdateCondition(index, "type", value)}
                            >
                              <SelectTrigger id={`condition-${index}-type`} className="bg-black/30 border-white/10">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0a0f14] border-white/10">
                                <SelectItem value="halftime_score">Half-Time Score</SelectItem>
                                <SelectItem value="fulltime_score">Full-Time Score</SelectItem>
                                <SelectItem value="score_change">Score Change</SelectItem>
                                <SelectItem value="team_performance">Team Performance</SelectItem>
                                <SelectItem value="custom">Custom Formula</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`condition-${index}-operator`}>Operator</Label>
                            <Select
                              value={condition.operator}
                              onValueChange={(value) => handleUpdateCondition(index, "operator", value)}
                            >
                              <SelectTrigger id={`condition-${index}-operator`} className="bg-black/30 border-white/10">
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0a0f14] border-white/10">
                                <SelectItem value="=">=</SelectItem>
                                <SelectItem value="!=">!=</SelectItem>
                                <SelectItem value=">">{">"}</SelectItem>
                                <SelectItem value="<">{"<"}</SelectItem>
                                <SelectItem value=">=">{"≥"}</SelectItem>
                                <SelectItem value="<=">{"≤"}</SelectItem>
                                <SelectItem value="between">Between</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {condition.type === "score_change" ? (
                            <div className="col-span-2">
                              <Label htmlFor={`condition-${index}-value`}>Value</Label>
                              <Select
                                value={condition.value}
                                onValueChange={(value) => handleUpdateCondition(index, "value", value)}
                              >
                                <SelectTrigger id={`condition-${index}-value`} className="bg-black/30 border-white/10">
                                  <SelectValue placeholder="Select value" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0f14] border-white/10">
                                  <SelectItem value="turnaround">Turnaround (Losing/Drawing → Win)</SelectItem>
                                  <SelectItem value="comeback">Comeback (Losing → Win/Draw)</SelectItem>
                                  <SelectItem value="blowout">Blowout (Win by 3+ goals)</SelectItem>
                                  <SelectItem value="late_winner">Late Winner (After 80th min)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="col-span-2">
                              <Label htmlFor={`condition-${index}-value`}>Value</Label>
                              <Input
                                id={`condition-${index}-value`}
                                value={condition.value || ""}
                                onChange={(e) => handleUpdateCondition(index, "value", e.target.value)}
                                placeholder="Value to compare against"
                                className="bg-black/30 border-white/10"
                              />
                            </div>
                          )}

                          {(condition.type === "halftime_score" ||
                            condition.type === "fulltime_score" ||
                            condition.type === "score_change") && (
                            <div className="col-span-2">
                              <Label htmlFor={`condition-${index}-target`}>Target Team</Label>
                              <Select
                                value={condition.target || "both"}
                                onValueChange={(value) => handleUpdateCondition(index, "target", value)}
                              >
                                <SelectTrigger id={`condition-${index}-target`} className="bg-black/30 border-white/10">
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
                            <div className="col-span-2">
                              <Label htmlFor={`condition-${index}-formula`}>Custom Formula</Label>
                              <Textarea
                                id={`condition-${index}-formula`}
                                value={condition.customFormula || ""}
                                onChange={(e) => handleUpdateCondition(index, "customFormula", e.target.value)}
                                placeholder="e.g., (ft_home - ht_home) > (ft_away - ht_away)"
                                className="bg-black/30 border-white/10"
                              />
                              <p className="text-xs text-gray-400 mt-1">
                                Available variables: ht_home, ht_away, ft_home, ft_away, home_change, away_change
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPattern} disabled={!newPattern.name}>
                Add Pattern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {patterns.length === 0 ? (
        <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2">No Patterns Defined</h3>
          <p className="text-gray-400 mb-4">Create your first pattern to start analyzing match data</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Pattern
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern) => (
            <Card key={pattern.id} className="bg-black/20 border border-white/10">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{pattern.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPattern(pattern)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeletePattern(pattern.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">{pattern.description}</p>

                <div className="space-y-2">
                  <h4 className="font-medium">Conditions:</h4>
                  <ul className="space-y-2">
                    {pattern.conditions.map((condition, index) => (
                      <li key={condition.id} className="p-2 bg-black/30 rounded border border-white/5">
                        {condition.type === "score_change" && condition.value === "turnaround" ? (
                          <span>
                            Detect{" "}
                            {condition.target === "both"
                              ? "any team"
                              : condition.target === "home"
                                ? "home team"
                                : "away team"}{" "}
                            turnaround (losing/drawing at half-time → winning at full-time)
                          </span>
                        ) : condition.type === "custom" ? (
                          <span>Custom formula: {condition.customFormula}</span>
                        ) : (
                          <span>
                            {condition.type.replace("_", " ")} {condition.operator} {condition.value}
                            {condition.target && ` (${condition.target} team)`}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-gray-500">
                Created: {new Date(pattern.createdAt).toLocaleDateString()}
                {pattern.updatedAt !== pattern.createdAt &&
                  ` • Updated: ${new Date(pattern.updatedAt).toLocaleDateString()}`}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Pattern Dialog */}
      <Dialog open={editingPatternId !== null} onOpenChange={(open) => !open && setEditingPatternId(null)}>
        <DialogContent className="bg-[#0a0f14] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Pattern</DialogTitle>
            <DialogDescription>Modify the pattern definition</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-pattern-name">Pattern Name</Label>
              <Input
                id="edit-pattern-name"
                value={newPattern.name || ""}
                onChange={(e) => setNewPattern((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-black/30 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pattern-description">Description</Label>
              <Textarea
                id="edit-pattern-description"
                value={newPattern.description || ""}
                onChange={(e) => setNewPattern((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-black/30 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Conditions</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddCondition}
                  className="gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </div>

              {(newPattern.conditions || []).length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No conditions defined. Add a condition to define the pattern.
                </div>
              ) : (
                <div className="space-y-4">
                  {(newPattern.conditions || []).map((condition, index) => (
                    <div key={condition.id} className="p-3 border border-white/10 rounded-md bg-black/20">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Condition {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCondition(index)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Same condition editing fields as in the Add dialog */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`edit-condition-${index}-type`}>Type</Label>
                          <Select
                            value={condition.type}
                            onValueChange={(value) => handleUpdateCondition(index, "type", value)}
                          >
                            <SelectTrigger id={`edit-condition-${index}-type`} className="bg-black/30 border-white/10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a0f14] border-white/10">
                              <SelectItem value="halftime_score">Half-Time Score</SelectItem>
                              <SelectItem value="fulltime_score">Full-Time Score</SelectItem>
                              <SelectItem value="score_change">Score Change</SelectItem>
                              <SelectItem value="team_performance">Team Performance</SelectItem>
                              <SelectItem value="custom">Custom Formula</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`edit-condition-${index}-operator`}>Operator</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => handleUpdateCondition(index, "operator", value)}
                          >
                            <SelectTrigger
                              id={`edit-condition-${index}-operator`}
                              className="bg-black/30 border-white/10"
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
                              <SelectItem value="between">Between</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Value field based on condition type */}
                        {condition.type === "score_change" ? (
                          <div className="col-span-2">
                            <Label htmlFor={`edit-condition-${index}-value`}>Value</Label>
                            <Select
                              value={condition.value}
                              onValueChange={(value) => handleUpdateCondition(index, "value", value)}
                            >
                              <SelectTrigger
                                id={`edit-condition-${index}-value`}
                                className="bg-black/30 border-white/10"
                              >
                                <SelectValue placeholder="Select value" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0a0f14] border-white/10">
                                <SelectItem value="turnaround">Turnaround (Losing/Drawing → Win)</SelectItem>
                                <SelectItem value="comeback">Comeback (Losing → Win/Draw)</SelectItem>
                                <SelectItem value="blowout">Blowout (Win by 3+ goals)</SelectItem>
                                <SelectItem value="late_winner">Late Winner (After 80th min)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="col-span-2">
                            <Label htmlFor={`edit-condition-${index}-value`}>Value</Label>
                            <Input
                              id={`edit-condition-${index}-value`}
                              value={condition.value || ""}
                              onChange={(e) => handleUpdateCondition(index, "value", e.target.value)}
                              placeholder="Value to compare against"
                              className="bg-black/30 border-white/10"
                            />
                          </div>
                        )}

                        {/* Target team field for score-related conditions */}
                        {(condition.type === "halftime_score" ||
                          condition.type === "fulltime_score" ||
                          condition.type === "score_change") && (
                          <div className="col-span-2">
                            <Label htmlFor={`edit-condition-${index}-target`}>Target Team</Label>
                            <Select
                              value={condition.target || "both"}
                              onValueChange={(value) => handleUpdateCondition(index, "target", value)}
                            >
                              <SelectTrigger
                                id={`edit-condition-${index}-target`}
                                className="bg-black/30 border-white/10"
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

                        {/* Custom formula field */}
                        {condition.type === "custom" && (
                          <div className="col-span-2">
                            <Label htmlFor={`edit-condition-${index}-formula`}>Custom Formula</Label>
                            <Textarea
                              id={`edit-condition-${index}-formula`}
                              value={condition.customFormula || ""}
                              onChange={(e) => handleUpdateCondition(index, "customFormula", e.target.value)}
                              placeholder="e.g., (ft_home - ht_home) > (ft_away - ht_away)"
                              className="bg-black/30 border-white/10"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              Available variables: ht_home, ht_away, ft_home, ft_away, home_change, away_change
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPatternId(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePattern} disabled={!newPattern.name}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

