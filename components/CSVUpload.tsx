"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CSVPreview } from "./CSVPreview"
import { MAX_FILE_SIZE_MB } from "../constants/csv.constants"
import type { Match } from "../types"
import type { DataImportService } from "../analysis/data-import-service"
import { useToast } from "@/hooks/use-toast"

interface CSVUploadProps {
  onMatchesImported: (matches: Match[]) => void
  dataImportService: DataImportService
}

export function CSVUpload({ onMatchesImported, dataImportService }: CSVUploadProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        fileRejections.forEach(({ file, errors }) => {
          errors.forEach((err: any) => {
            if (err.code === "file-too-large") {
              toast({
                title: "File Too Large",
                description: `File "${file.name}" is larger than ${MAX_FILE_SIZE_MB}MB.`,
                variant: "destructive",
              })
            } else if (err.code === "file-invalid-type") {
              toast({
                title: "Invalid File Type",
                description: `File "${file.name}" is not a valid CSV.`,
                variant: "destructive",
              })
            } else {
              toast({
                title: "File Error",
                description: `File "${file.name}": ${err.message}`,
                variant: "destructive",
              })
            }
          })
        })
        setFile(null) // Clear any previously selected file on rejection
        return
      }

      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        setUploadProgress(0)
        setIsUploading(false)
      }
    },
    [toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"], // Common MIME type for CSV
    },
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024, // 5 MB
    multiple: false,
  })

  const handleRemoveFile = () => {
    setFile(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  const handleConfirmImport = async (matches: Match[]) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 50)) // Small delay
      }

      // In a real scenario, you might send the file to a server or process it here
      // For this example, we directly use the parsed matches
      onMatchesImported(matches)
      setFile(null) // Clear file after successful import
      toast({
        title: "Import Successful",
        description: `${matches.length} matches have been imported.`,
      })
    } catch (error) {
      console.error("Error during import confirmation:", error)
      toast({
        title: "Import Failed",
        description: "There was an error importing the matches.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <Card
          {...getRootProps()}
          className={`
            border-2 border-dashed p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-700 hover:border-blue-500"}
            bg-black/30 text-gray-400
          `}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-4 text-lg">Drag & drop your CSV file here, or click to select</p>
          <p className="text-sm text-gray-500">Max file size: {MAX_FILE_SIZE_MB}MB. Only .csv files are supported.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-black/30 rounded-md border border-white/10">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <span className="font-medium text-white">{file.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Uploading...</p>
              <Progress value={uploadProgress} className="w-full h-2 bg-black/50" indicatorClassName="bg-blue-500" />
            </div>
          )}

          {!isUploading && (
            <CSVPreview
              file={file}
              onConfirm={handleConfirmImport}
              onCancel={handleRemoveFile} // Treat cancel as removing the file from preview
            />
          )}
        </div>
      )}
    </div>
  )
}
