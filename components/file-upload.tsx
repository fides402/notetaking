"use client"

import type React from "react"

import { forwardRef } from "react"
import type { Attachment } from "@/lib/types"

interface FileUploadProps {
  onUploadStart: () => void
  onUploadComplete: (attachment: Attachment) => void
  onUploadError: (error: string) => void
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ onUploadStart, onUploadComplete, onUploadError }, ref) => {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        onUploadError("File size exceeds 10MB limit")
        return
      }

      // Allowed file types
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "text/plain",
        "text/csv",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      if (!allowedTypes.includes(file.type)) {
        onUploadError("File type not supported")
        return
      }

      onUploadStart()

      const formData = new FormData()
      formData.append("file", file)

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()

        onUploadComplete({
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileType: file.type,
          fileSize: file.size,
        })

        // Reset the input
        if (e.target) {
          e.target.value = ""
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        onUploadError("Failed to upload file. Please try again.")
      }
    }

    return (
      <input
        type="file"
        ref={ref}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.txt,.csv,.doc,.docx"
      />
    )
  },
)

FileUpload.displayName = "FileUpload"

export default FileUpload
