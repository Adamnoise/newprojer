"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, CheckCircle, XCircle } from "lucide-react"
import { useCSVPreview } from "../hooks/useCSVPreview"
import { ValidationSummary } from "./ValidationSummary"
import { DataPreviewTable } from "./DataPreviewTable"
import ErrorBoundary from "./ErrorBoundary"
import type { Match } from "../types"

interface CSVPreviewProps {
  file: File | null
  onConfirm: (matches: Match[]) => void
  onCancel: () => void
}

export function CSVPreview({ file, onConfirm, onCancel }: CSVPreviewProps) {
  const { isLoading, parsedData, validationResult, fileName, parseFile, resetPreview } = useCSVPreview()

  // Parse file when component mounts or file changes
  React.useEffect(() => {
    if (file) {
      parseFile(file)
    } else {
      resetPreview()
    }
  }, [file, parseFile, resetPreview])

  const handleConfirm = () => {
    if (parsedData && validationResult?.isValid) {
      onConfirm(parsedData)
    }
  }

  if (!file) {
    return <div className="text-center text-gray-400 py-8">No file selected for preview.</div>
  }

  return (
    <ErrorBoundary>
      <Card className="bg-black/20 border-white/10 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <FileText className="h-6 w-6 text-blue-400" />
            CSV Preview: {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="mt-4 text-lg text-gray-300">Parsing and validating CSV...</p>
            </div>
          )}

          {!isLoading && validationResult && <ValidationSummary validationResult={validationResult} />}

          {!isLoading && parsedData && parsedData.length > 0 && validationResult?.isValid && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Data Preview ({parsedData.length} rows)</h3>
              <DataPreviewTable data={parsedData} />
            </div>
          )}

          {!isLoading && (
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!parsedData || parsedData.length === 0 || !validationResult?.isValid}
                className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {validationResult?.isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4" /> Confirm Import
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" /> Cannot Import
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
