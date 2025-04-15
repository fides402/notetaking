"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, ArrowLeft, Paperclip, MessageSquare } from "lucide-react"
import type { Note, Attachment } from "@/lib/types"
import { createNote, updateNote } from "@/lib/notes-client"
import { useToast } from "@/hooks/use-toast"
import FileUpload from "./file-upload"
import AttachmentList from "./attachment-list"
import ChatPanel from "./chat-panel"

interface NoteEditorProps {
  note?: Note
  isNew?: boolean
}

export default function NoteEditor({ note, isNew = false }: NoteEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [attachments, setAttachments] = useState<Attachment[]>(note?.attachments || [])
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showChatPanel, setShowChatPanel] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && attachments.length === 0) {
      toast({
        title: "Cannot save empty note",
        description: "Please add a title, content, or attachments.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      if (isNew) {
        const newNote = await createNote({
          title: title.trim() || "Untitled Note",
          content,
          attachments,
        })

        toast({
          title: "Note created",
          description: "Your note has been successfully created.",
        })

        router.push(`/notes/${newNote.id}`)
      } else if (note) {
        await updateNote(note.id, {
          title: title.trim() || "Untitled Note",
          content,
          attachments,
        })

        toast({
          title: "Note updated",
          description: "Your note has been successfully updated.",
        })

        router.refresh()
      }
    } catch (error) {
      console.error("Error saving note:", error)
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileUploadComplete = (newAttachment: Attachment) => {
    setAttachments([...attachments, newAttachment])
    setIsUploading(false)
  }

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments]
    newAttachments.splice(index, 1)
    setAttachments(newAttachments)
  }

  const toggleChatPanel = () => {
    setShowChatPanel(!showChatPanel)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleChatPanel}
              className={showChatPanel ? "bg-secondary" : ""}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <Paperclip className="h-5 w-5" />
            </Button>

            <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`md:col-span-${showChatPanel ? "2" : "3"}`}>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold"
              />

              <Textarea
                placeholder="Start writing your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] resize-none"
              />

              {attachments.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Attachments</h3>
                  <AttachmentList attachments={attachments} onRemove={handleRemoveAttachment} />
                </div>
              )}

              <FileUpload
                ref={fileInputRef}
                onUploadStart={() => setIsUploading(true)}
                onUploadComplete={handleFileUploadComplete}
                onUploadError={(error) => {
                  setIsUploading(false)
                  toast({
                    title: "Upload failed",
                    description: error,
                    variant: "destructive",
                  })
                }}
              />
            </div>
          </div>

          {showChatPanel && (
            <div className="md:col-span-1">
              <ChatPanel noteId={note?.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
