"use client"

import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CSVValidationResult } from "../types/csv.types"
import { ErrorList } from "./ErrorList"

interface ValidationSummaryProps {
  validationResult: CSVValidationResult
}

export function ValidationSummary({ validationResult }: ValidationSummaryProps) {
  const { isValid, errors, warnings, parsedData } = validationResult

  const totalRows = parsedData.length + errors.filter((e) => e.row !== -1).length // Count valid and errored rows
  const validRows = parsedData.length
  const errorRows = errors.filter((e) => e.row !== -1).length
  const warningCount = warnings.length

  const getStatusIcon = () => {
    if (isValid) {
      return <CheckCircle className="h-6 w-6 text-emerald-500" />
    } else if (errors.length > 0) {
      return <XCircle className="h-6 w-6 text-red-500" />
    } else if (warnings.length > 0) {
      return <AlertTriangle className="h-6 w-6 text-amber-500" />
    }
    return <Info className="h-6 w-6 text-gray-500" />
  }

  const getStatusTitle = () => {
    if (isValid) {
      return "Validation Successful"
    } else if (errors.length > 0) {
      return "Validation Failed"
    } else if (warnings.length > 0) {
      return "Validation with Warnings"
    }
    return "Validation Summary"
  }

  const getStatusDescription = () => {
    if (isValid) {
      return `All ${validRows} rows processed successfully.`
    } else if (errors.length > 0) {
      return `Found ${errors.length} errors. Please fix them to proceed.`
    } else if (warnings.length > 0) {
      return `Found ${warnings.length} warnings. Data can be processed, but review these issues.`
    }
    return "Review the validation results below."
  }

  return (
    <Card className="bg-black/20 border-white/10 text-white">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        {getStatusIcon()}
        <div>
          <CardTitle className="text-xl font-bold">{getStatusTitle()}</CardTitle>
          <p className="text-sm text-gray-400">{getStatusDescription()}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-black/30 rounded-md border border-white/5">
            <p className="text-2xl font-bold text-blue-400">{totalRows}</p>
            <p className="text-sm text-gray-400">Total Rows</p>
          </div>
          <div className="p-3 bg-black/30 rounded-md border border-white/5">
            <p className="text-2xl font-bold text-emerald-400">{validRows}</p>
            <p className="text-sm text-gray-400">Valid Rows</p>
          </div>
          <div className="p-3 bg-black/30 rounded-md border border-white/5">
            <p className="text-2xl font-bold text-red-400">{errorRows}</p>
            <p className="text-sm text-gray-400">Errored Rows</p>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Warnings ({warnings.length})
            </h3>
            <ErrorList errors={warnings} type="warning" />
          </div>
        )}

        {errors.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> Errors ({errors.length})
            </h3>
            <ErrorList errors={errors} type="error" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
