"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, FileText } from "lucide-react"

interface FileUploadProps {
  accept?: string
  label: string
  description?: string
  onFileSelect: (file: File) => void
}

export function FileUpload({ accept = ".pdf,.docx,.doc", label, description, onFileSelect }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      onFileSelect(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      onFileSelect(droppedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card
      className={`border-2 border-dashed ${isDragging ? "border-primary" : "border-gray-200"} hover:border-primary transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <input type="file" accept={accept} onChange={handleFileChange} className="hidden" ref={fileInputRef} />

        {!file ? (
          <>
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">{label}</h3>
            {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleClick} variant="outline" size="sm">
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground mt-2 sm:mt-1">or drag and drop</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <FileText className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="flex-shrink-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
