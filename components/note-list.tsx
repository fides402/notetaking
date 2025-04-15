import { getAllNotes } from "@/lib/notes"
import NoteCard from "./note-card"
import { EmptyState } from "./empty-state"

export default async function NoteList() {
  const notes = await getAllNotes()

  if (notes.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  )
}
