import { notFound } from "next/navigation"
import NoteEditor from "@/components/note-editor"
import { getNoteById } from "@/lib/notes"

export default async function NotePage({ params }: { params: { id: string } }) {
  // For new notes, we'll handle it in the editor
  if (params.id === "new") {
    return <NoteEditor isNew />
  }

  try {
    const note = await getNoteById(params.id)

    if (!note) {
      notFound()
    }

    return <NoteEditor note={note} />
  } catch (error) {
    console.error("Error loading note:", error)
    notFound()
  }
}
