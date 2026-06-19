"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface DataPreviewTableProps {
  data: any[]
  maxRows?: number
}

export function DataPreviewTable({ data, maxRows = 10 }: DataPreviewTableProps) {
  const [expanded, setExpanded] = useState(false)

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-400 py-8">No data to preview.</p>
  }

  const headers = Object.keys(data[0] || {})
  const displayData = expanded ? data : data.slice(0, maxRows)

  return (
    <div className="rounded-md border border-white/10 overflow-hidden bg-black/20">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-black/40">
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              {headers.map((header) => (
                <TableHead key={header} className="text-gray-400 font-normal whitespace-nowrap">
                  {header.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="border-b border-white/5 hover:bg-white/5">
                {headers.map((header) => (
                  <TableCell key={`${rowIndex}-${header}`} className="text-white whitespace-nowrap">
                    {String(row[header])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {data.length > maxRows && !expanded && (
              <TableRow>
                <TableCell colSpan={headers.length} className="text-center text-gray-400 py-4">
                  ... {data.length - maxRows} more rows ...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {data.length > maxRows && (
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
                <ChevronDown className="h-4 w-4 mr-2" /> Show All ({data.length} rows)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
