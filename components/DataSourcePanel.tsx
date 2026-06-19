"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Plus, Database, FileText, Globe, Trash, Edit, RefreshCw, Info } from "lucide-react"
import type { DataSource } from "../analysis/types"

interface DataSourcePanelProps {
  dataSources: DataSource[]
  onAddDataSource: (dataSource: DataSource) => void
  onUpdateDataSource: (dataSource: DataSource) => void
  onDeleteDataSource: (dataSourceId: string) => void
  onSyncDataSource: (dataSourceId: string) => void
}

export function DataSourcePanel({
  dataSources,
  onAddDataSource,
  onUpdateDataSource,
  onDeleteDataSource,
  onSyncDataSource,
}: DataSourcePanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDataSourceId, setEditingDataSourceId] = useState<string | null>(null)
  const [newDataSource, setNewDataSource] = useState<Partial<DataSource>>({
    name: "",
    type: "csv",
    config: {},
  })

  const resetNewDataSourceForm = () => {
    setNewDataSource({
      name: "",
      type: "csv",
      config: {},
    })
  }

  const handleAddDataSource = () => {
    if (!newDataSource.name || !newDataSource.type) return

    const dataSource: DataSource = {
      id: `ds-${Date.now()}`,
      name: newDataSource.name,
      type: newDataSource.type,
      config: newDataSource.config || {},
      lastSynced: undefined,
    }

    onAddDataSource(dataSource)
    setIsAddDialogOpen(false)
    resetNewDataSourceForm()
  }

  const handleEditDataSource = (dataSource: DataSource) => {
    setEditingDataSourceId(dataSource.id)
    setNewDataSource({
      name: dataSource.name,
      type: dataSource.type,
      config: dataSource.config,
    })
  }

  const handleUpdateDataSource = () => {
    if (!editingDataSourceId || !newDataSource.name || !newDataSource.type) return

    const updatedDataSource: DataSource = {
      id: editingDataSourceId,
      name: newDataSource.name,
      type: newDataSource.type,
      config: newDataSource.config || {},
      lastSynced: dataSources.find((ds) => ds.id === editingDataSourceId)?.lastSynced,
    }

    onUpdateDataSource(updatedDataSource)
    setEditingDataSourceId(null)
    resetNewDataSourceForm()
  }

  const handleUpdateConfig = (key: string, value: any) => {
    setNewDataSource((prev) => ({
      ...prev,
      config: {
        ...(prev.config || {}),
        [key]: value,
      },
    }))
  }

  const getDataSourceIcon = (type: DataSource["type"]) => {
    switch (type) {
      case "csv":
        return <FileText className="w-4 h-4" />
      case "database":
        return <Database className="w-4 h-4" />
      case "api":
        return <Globe className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Data Sources</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Data Source
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-[#0a0f14] border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Add New Data Source</DialogTitle>
              <DialogDescription>Configure a new source for your match data.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ds-name">Data Source Name</Label>
                <Input
                  id="ds-name"
                  value={newDataSource.name || ""}
                  onChange={(e) => setNewDataSource((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premier League CSV"
                  className="bg-black/30 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ds-type">Type</Label>
                <Select
                  value={newDataSource.type}
                  onValueChange={(value) =>
                    setNewDataSource((prev) => ({ ...prev, type: value as DataSource["type"] }))
                  }
                >
                  <SelectTrigger id="ds-type" className="bg-black/30 border-white/10">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f14] border-white/10">
                    <SelectItem value="csv">CSV File</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newDataSource.type === "database" && (
                <div className="space-y-2">
                  <Label htmlFor="db-connection-string">Connection String</Label>
                  <Input
                    id="db-connection-string"
                    value={newDataSource.config?.connectionString || ""}
                    onChange={(e) => handleUpdateConfig("connectionString", e.target.value)}
                    placeholder="e.g., postgres://user:pass@host:port/db"
                    className="bg-black/30 border-white/10"
                  />
                </div>
              )}

              {newDataSource.type === "api" && (
                <div className="space-y-2">
                  <Label htmlFor="api-url">API URL</Label>
                  <Input
                    id="api-url"
                    value={newDataSource.config?.url || ""}
                    onChange={(e) => handleUpdateConfig("url", e.target.value)}
                    placeholder="e.g., https://api.example.com/matches"
                    className="bg-black/30 border-white/10"
                  />
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input
                    id="api-key"
                    value={newDataSource.config?.apiKey || ""}
                    onChange={(e) => handleUpdateConfig("apiKey", e.target.value)}
                    placeholder="Your API Key"
                    type="password"
                    className="bg-black/30 border-white/10"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDataSource} disabled={!newDataSource.name || !newDataSource.type}>
                Add Data Source
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {dataSources.length === 0 ? (
        <div className="text-center py-12 bg-black/20 rounded-lg border border-white/10">
          <h3 className="text-lg font-medium mb-2">No Data Sources Configured</h3>
          <p className="text-gray-400 mb-4">Add a data source to import match data for analysis.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Data Source
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataSources.map((dataSource) => (
            <Card key={dataSource.id} className="bg-black/20 border border-white/10">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getDataSourceIcon(dataSource.type)}
                    <span>{dataSource.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDataSource(dataSource)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteDataSource(dataSource.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-400">Type: </span>
                    <span>{dataSource.type.toUpperCase()}</span>
                  </p>
                  {dataSource.lastSynced && (
                    <p>
                      <span className="text-gray-400">Last Synced: </span>
                      <span>{new Date(dataSource.lastSynced).toLocaleString()}</span>
                    </p>
                  )}
                  {dataSource.type === "api" && dataSource.config?.url && (
                    <p className="truncate">
                      <span className="text-gray-400">URL: </span>
                      <span>{dataSource.config.url}</span>
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => onSyncDataSource(dataSource.id)}
                  className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <RefreshCw className="w-4 h-4" /> Sync Data
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Data Source Dialog */}
      <Dialog open={editingDataSourceId !== null} onOpenChange={(open) => !open && setEditingDataSourceId(null)}>
        <DialogContent className="sm:max-w-md bg-[#0a0f14] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Edit Data Source</DialogTitle>
            <DialogDescription>Modify the data source configuration.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ds-name">Data Source Name</Label>
              <Input
                id="edit-ds-name"
                value={newDataSource.name || ""}
                onChange={(e) => setNewDataSource((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-black/30 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ds-type">Type</Label>
              <Select
                value={newDataSource.type}
                onValueChange={(value) => setNewDataSource((prev) => ({ ...prev, type: value as DataSource["type"] }))}
              >
                <SelectTrigger id="edit-ds-type" className="bg-black/30 border-white/10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f14] border-white/10">
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newDataSource.type === "database" && (
              <div className="space-y-2">
                <Label htmlFor="edit-db-connection-string">Connection String</Label>
                <Input
                  id="edit-db-connection-string"
                  value={newDataSource.config?.connectionString || ""}
                  onChange={(e) => handleUpdateConfig("connectionString", e.target.value)}
                  className="bg-black/30 border-white/10"
                />
              </div>
            )}

            {newDataSource.type === "api" && (
              <div className="space-y-2">
                <Label htmlFor="edit-api-url">API URL</Label>
                <Input
                  id="edit-api-url"
                  value={newDataSource.config?.url || ""}
                  onChange={(e) => handleUpdateConfig("url", e.target.value)}
                  className="bg-black/30 border-white/10"
                />
                <Label htmlFor="edit-api-key">API Key (Optional)</Label>
                <Input
                  id="edit-api-key"
                  value={newDataSource.config?.apiKey || ""}
                  onChange={(e) => handleUpdateConfig("apiKey", e.target.value)}
                  type="password"
                  className="bg-black/30 border-white/10"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDataSourceId(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDataSource} disabled={!newDataSource.name || !newDataSource.type}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
