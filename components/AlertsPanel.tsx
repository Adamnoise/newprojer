"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { Plus, Bell, Trash, Edit, Mail, Globe } from "lucide-react"
import type { Alert, AlertCondition, AlertAction, PatternDefinition } from "../analysis/types"

interface AlertsPanelProps {
  alerts: Alert[]
  patterns: PatternDefinition[]
  onAddAlert: (alert: Alert) => void
  onUpdateAlert: (alert: Alert) => void
  onDeleteAlert: (alertId: string) => void
}

export function AlertsPanel({ alerts, patterns, onAddAlert, onUpdateAlert, onDeleteAlert }: AlertsPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null)
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({
    name: "",
    patternId: "",
    conditions: [],
    actions: [],
    isActive: true,
  })

  // Reset new alert form
  const resetNewAlertForm = () => {
    setNewAlert({
      name: "",
      patternId: "",
      conditions: [],
      actions: [],
      isActive: true,
    })
  }

  // Handle adding a new alert
  const handleAddAlert = () => {
    if (!newAlert.name || !newAlert.patternId) return

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      name: newAlert.name,
      patternId: newAlert.patternId,
      conditions: newAlert.conditions || [],
      actions: newAlert.actions || [],
      isActive: newAlert.isActive !== undefined ? newAlert.isActive : true,
    }

    onAddAlert(alert)
    setIsAddDialogOpen(false)
    resetNewAlertForm()
  }

  // Handle editing an alert
  const handleEditAlert = (alert: Alert) => {
    setEditingAlertId(alert.id)
    setNewAlert({
      name: alert.name,
      patternId: alert.patternId,
      conditions: alert.conditions,
      actions: alert.actions,
      isActive: alert.isActive,
    })
  }

  // Handle updating an alert
  const handleUpdateAlert = () => {
    if (!editingAlertId || !newAlert.name || !newAlert.patternId) return

    const updatedAlert: Alert = {
      id: editingAlertId,
      name: newAlert.name,
      patternId: newAlert.patternId,
      conditions: newAlert.conditions || [],
      actions: newAlert.actions || [],
      isActive: newAlert.isActive !== undefined ? newAlert.isActive : true,
    }

    onUpdateAlert(updatedAlert)
    setEditingAlertId(null)
    resetNewAlertForm()
  }

  // Handle adding a condition to the alert
  const handleAddCondition = () => {
    const newCondition: AlertCondition = {
      type: "frequency",
      operator: ">",
      value: 0.5,
    }

    setNewAlert((prev) => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition],
    }))
  }

  // Handle updating a condition
  const handleUpdateCondition = (index: number, field: keyof AlertCondition, value: any) => {
    setNewAlert((prev) => {
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
    setNewAlert((prev) => {
      const updatedConditions = [...(prev.conditions || [])]
      updatedConditions.splice(index, 1)

      return {
        ...prev,
        conditions: updatedConditions,
      }
    })
  }

  // Handle adding an action to the alert
  const handleAddAction = () => {
    const newAction: AlertAction = {
      type: "notification",
      config: {},
    }

    setNewAlert((prev) => ({
      ...prev,
      actions: [...(prev.actions || []), newAction],
    }))
  }

  // Handle updating an action
  const handleUpdateAction = (index: number, field: keyof AlertAction, value: any) => {
    setNewAlert((prev) => {
      const updatedActions = [...(prev.actions || [])]
      updatedActions[index] = {
        ...updatedActions[index],
        [field]: value,
      }

      return {
        ...prev,
        actions: updatedActions,
      }
    })
  }

  // Handle updating action config
  const handleUpdateActionConfig = (index: number, key: string, value: any) => {
    setNewAlert((prev) => {
      const updatedActions = [...(prev.actions || [])]
      updatedActions[index] = {
        ...updatedActions[index],
        config: {
          ...(updatedActions[index].config || {}),
          [key]: value,
        },
      }

      return {
        ...prev,
        actions: updatedActions,
      }
    })
  }

  // Handle removing an action
  const handleRemoveAction = (index: number) => {
    setNewAlert((prev) => {
      const updatedActions = [...(prev.actions || [])]
      updatedActions.splice(index, 1)

      return {
        ...prev,
        actions: updatedActions,
      }
    })
  }

  // Handle toggling alert active state
  const handleToggleAlertActive = (alert: Alert) => {
    const updatedAlert = {
      ...alert,
      isActive: !alert.isActive,
    }

    onUpdateAlert(updatedAlert)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Alerts</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0f14] border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add New Alert</DialogTitle>
              <DialogDescription>Configure an alert for pattern detection</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="alert-name">Alert Name</Label>
                <Input
                  id="alert-name"
                  value={newAlert.name || ""}
                  onChange={(e) => setNewAlert((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., High Frequency Turnaround Alert"
                  className="bg-black/30 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-pattern">Pattern</Label>
                <Select
                  value={newAlert.patternId}
                  onValueChange={(value) => setNewAlert((prev) => ({ ...prev, patternId: value }))}
                >
                  <SelectTrigger id="alert-pattern" className="bg-black/30 border-white/10">
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f14] border-white/10">
                    {patterns.map((pattern) => (
                      <SelectItem key={pattern.id} value={pattern.id}>
                        {pattern.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

                {(newAlert.conditions || []).length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No conditions defined. Add a condition to trigger the alert.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(newAlert.conditions || []).map((condition, index) => (
                      <div key={index} className="p-3 border border-white/10 rounded-md bg-black/20">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Condition {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCondition(index)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
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
                                <SelectItem value="frequency">Frequency</SelectItem>
                                <SelectItem value="confidence">Confidence</SelectItem>
                                <SelectItem value="occurrence_count">Occurrence Count</SelectItem>
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
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`condition-${index}-value`}>Value</Label>
                            <Input
                              id={`condition-${index}-value`}
                              type="number"
                              value={condition.value}
                              onChange={(e) => handleUpdateCondition(index, "value", Number.parseFloat(e.target.value))}
                              className="bg-black/30 border-white/10"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Actions</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddAction}
                    className="gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>

                {(newAlert.actions || []).length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No actions defined. Add an action to execute when the alert is triggered.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(newAlert.actions || []).map((action, index) => (
                      <div key={index} className="p-3 border border-white/10 rounded-md bg-black/20">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Action {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAction(index)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`action-${index}-type`}>Type</Label>
                            <Select
                              value={action.type}
                              onValueChange={(value) => handleUpdateAction(index, "type", value)}
                            >
                              <SelectTrigger id={`action-${index}-type`} className="bg-black/30 border-white/10">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0a0f14] border-white/10">
                                <SelectItem value="notification">In-App Notification</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="webhook">Webhook</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {action.type === "email" && (
                            <div>
                              <Label htmlFor={`action-${index}-email`}>Email Address</Label>
                              <Input
                                id={`action-${index}-email`}
                                value={action.config?.email || ""}
                                onChange={(e) => handleUpdateActionConfig(index, "email", e.target.value)}
                                placeholder="Enter email address"
                                className="bg-black/30 border-white/10"
                              />
                            </div>
                          )}

                          {action.type === "webhook" && (
                            <div>
                              <Label htmlFor={`action-${index}-url`}>Webhook URL</Label>
                              <Input
                                id={`action-${index}-url`}
                                value={action.config?.url || ""}
                                onChange={(e) => handleUpdateActionConfig(index, "url", e.target.value)}
                                placeholder="Enter webhook URL"
                                className="bg-black/30 border-white/10"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="alert-active"
                  checked={newAlert.isActive}
                  onCheckedChange={(value) => setNewAlert((prev) => ({ ...prev, isActive: value }))}
                />
                <Label htmlFor="alert-active">Alert Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddAlert}
                disabled={
                  !newAlert.name ||
                  !newAlert.patternId ||
                  (newAlert.conditions || []).length === 0 ||
                  (newAlert.actions || []).length === 0
                }
              >
                Add Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2">No Alerts Configured</h3>
          <p className="text-gray-400 mb-4">Create alerts to get notified when patterns are detected</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Alert
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const pattern = patterns.find((p) => p.id === alert.patternId)

            return (
              <Card key={alert.id} className="bg-black/20 border border-white/10">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <span>{alert.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditAlert(alert)} className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteAlert(alert.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <span className="text-gray-400">Pattern: </span>
                      <span>{pattern?.name || "Unknown Pattern"}</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm text-gray-400">Conditions:</h4>
                      <ul className="space-y-1">
                        {alert.conditions.map((condition, index) => (
                          <li key={index} className="text-sm">
                            {condition.type === "frequency" && "Pattern frequency"}
                            {condition.type === "confidence" && "Pattern confidence"}
                            {condition.type === "occurrence_count" && "Occurrence count"} {condition.operator}{" "}
                            {condition.value}
                            {condition.type === "frequency" && "%"}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm text-gray-400">Actions:</h4>
                      <ul className="space-y-1">
                        {alert.actions.map((action, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            {action.type === "notification" && (
                              <>
                                <Bell className="w-3 h-3" />
                                <span>Send in-app notification</span>
                              </>
                            )}
                            {action.type === "email" && (
                              <>
                                <Mail className="w-3 h-3" />
                                <span>Send email to {action.config?.email || "user"}</span>
                              </>
                            )}
                            {action.type === "webhook" && (
                              <>
                                <Globe className="w-3 h-3" />
                                <span>Call webhook {action.config?.url ? `at ${action.config.url}` : ""}</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {alert.lastTriggered && (
                      <div className="text-sm">
                        <span className="text-gray-400">Last triggered: </span>
                        <span>{new Date(alert.lastTriggered).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`alert-active-${alert.id}`}
                      checked={alert.isActive}
                      onCheckedChange={() => handleToggleAlertActive(alert)}
                    />
                    <Label htmlFor={`alert-active-${alert.id}`}>{alert.isActive ? "Active" : "Inactive"}</Label>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Alert Dialog */}
      <Dialog open={editingAlertId !== null} onOpenChange={(open) => !open && setEditingAlertId(null)}>
        <DialogContent className="bg-[#0a0f14] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
            <DialogDescription>Modify the alert configuration</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-alert-name">Alert Name</Label>
              <Input
                id="edit-alert-name"
                value={newAlert.name || ""}
                onChange={(e) => setNewAlert((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-black/30 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-alert-pattern">Pattern</Label>
              <Select
                value={newAlert.patternId}
                onValueChange={(value) => setNewAlert((prev) => ({ ...prev, patternId: value }))}
              >
                <SelectTrigger id="edit-alert-pattern" className="bg-black/30 border-white/10">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f14] border-white/10">
                  {patterns.map((pattern) => (
                    <SelectItem key={pattern.id} value={pattern.id}>
                      {pattern.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Same condition and action editing fields as in the Add dialog */}
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

              {(newAlert.conditions || []).length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No conditions defined. Add a condition to trigger the alert.
                </div>
              ) : (
                <div className="space-y-4">
                  {(newAlert.conditions || []).map((condition, index) => (
                    <div key={index} className="p-3 border border-white/10 rounded-md bg-black/20">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Condition {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCondition(index)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
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
                              <SelectItem value="frequency">Frequency</SelectItem>
                              <SelectItem value="confidence">Confidence</SelectItem>
                              <SelectItem value="occurrence_count">Occurrence Count</SelectItem>
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
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor={`edit-condition-${index}-value`}>Value</Label>
                          <Input
                            id={`edit-condition-${index}-value`}
                            type="number"
                            value={condition.value}
                            onChange={(e) => handleUpdateCondition(index, "value", Number.parseFloat(e.target.value))}
                            className="bg-black/30 border-white/10"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Actions</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAction}
                  className="gap-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </div>

              {(newAlert.actions || []).length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No actions defined. Add an action to execute when the alert is triggered.
                </div>
              ) : (
                <div className="space-y-4">
                  {(newAlert.actions || []).map((action, index) => (
                    <div key={index} className="p-3 border border-white/10 rounded-md bg-black/20">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Action {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAction(index)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-action-${index}-type`}>Type</Label>
                          <Select
                            value={action.type}
                            onValueChange={(value) => handleUpdateAction(index, "type", value)}
                          >
                            <SelectTrigger id={`edit-action-${index}-type`} className="bg-black/30 border-white/10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a0f14] border-white/10">
                              <SelectItem value="notification">In-App Notification</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="webhook">Webhook</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {action.type === "email" && (
                          <div>
                            <Label htmlFor={`edit-action-${index}-email`}>Email Address</Label>
                            <Input
                              id={`edit-action-${index}-email`}
                              value={action.config?.email || ""}
                              onChange={(e) => handleUpdateActionConfig(index, "email", e.target.value)}
                              placeholder="Enter email address"
                              className="bg-black/30 border-white/10"
                            />
                          </div>
                        )}

                        {action.type === "webhook" && (
                          <div>
                            <Label htmlFor={`edit-action-${index}-url`}>Webhook URL</Label>
                            <Input
                              id={`edit-action-${index}-url`}
                              value={action.config?.url || ""}
                              onChange={(e) => handleUpdateActionConfig(index, "url", e.target.value)}
                              placeholder="Enter webhook URL"
                              className="bg-black/30 border-white/10"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-alert-active"
                checked={newAlert.isActive}
                onCheckedChange={(value) => setNewAlert((prev) => ({ ...prev, isActive: value }))}
              />
              <Label htmlFor="edit-alert-active">Alert Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAlertId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAlert}
              disabled={
                !newAlert.name ||
                !newAlert.patternId ||
                (newAlert.conditions || []).length === 0 ||
                (newAlert.actions || []).length === 0
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

