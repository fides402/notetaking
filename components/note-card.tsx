"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, ImageIcon, File, MessageSquare } from "lucide-react"
import type { Note } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { deleteNote } from "@/lib/notes-client"
import { useToast } from "@/hooks/use-toast"

export default function NoteCard({ note }: { note: Note }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (confirm("Are you sure you want to delete this note?")) {
      setIsDeleting(true)

      try {
        await deleteNote(note.id)
        toast({
          title: "Note deleted",
          description: "Your note has been successfully deleted.",
        })
        router.refresh()
      } catch (error) {
        console.error("Error deleting note:", error)
        toast({
          title: "Error",
          description: "Failed to delete note. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Determine if the note has attachments
  const hasAttachments = note.attachments && note.attachments.length > 0

  // Get the first image attachment if any
  const firstImage = note.attachments?.find((attachment) => attachment.fileType.startsWith("image/"))

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-start">
            <span className="truncate">{note.title || "Untitled Note"}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-2">
          {firstImage && (
            <div className="w-full h-32 mb-2 rounded-md overflow-hidden">
              <ImageIcon
                src={firstImage.fileUrl || "/placeholder.svg"}
                alt={firstImage.fileName || "Attachment"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-3">{note.content || "No content"}</p>
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <div className="flex items-center text-xs text-muted-foreground">{formatDate(note.updatedAt)}</div>

          <div className="flex gap-1">
            {hasAttachments && (
              <div className="flex items-center text-xs text-muted-foreground">
                <File className="h-3 w-3 mr-1" />
                {note.attachments.length}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/chat?noteId=${note.id}`)
              }}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/notes/${note.id}`)
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
