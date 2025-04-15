"use client"

import type { Attachment } from "@/lib/types"
import { FileText, ImageIcon, File, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "@/lib/utils"

interface AttachmentListProps {
  attachments: Attachment[]
  onRemove: (index: number) => void
}

export default function AttachmentList({ attachments, onRemove }: AttachmentListProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />
    } else if (fileType === "application/pdf") {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-2">
      {attachments.map((attachment, index) => (
        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
          <div className="flex items-center gap-2">
            {getFileIcon(attachment.fileType)}
            <span className="text-sm truncate max-w-[200px]">{attachment.fileName}</span>
            <span className="text-xs text-muted-foreground">{formatFileSize(attachment.fileSize)}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemove(index)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}
