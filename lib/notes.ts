import type { Note } from "./types"
import { v4 as uuidv4 } from "uuid"

// In a real app, this would be a database
const notes: Note[] = [
  {
    id: "1",
    title: "Welcome to NotionKeep",
    content: "This is your first note. You can edit it or create a new one.",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function getAllNotes(): Promise<Note[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return a copy of the notes array to avoid mutations
  return [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export async function getNoteById(id: string): Promise<Note | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const note = notes.find((note) => note.id === id)
  return note ? { ...note } : null
}

export async function createNote(noteData: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const now = new Date().toISOString()
  const newNote: Note = {
    id: uuidv4(),
    ...noteData,
    createdAt: now,
    updatedAt: now,
  }

  notes.unshift(newNote)
  return { ...newNote }
}

export async function updateNote(
  id: string,
  noteData: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>,
): Promise<Note | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const noteIndex = notes.findIndex((note) => note.id === id)

  if (noteIndex === -1) {
    return null
  }

  const updatedNote: Note = {
    ...notes[noteIndex],
    ...noteData,
    updatedAt: new Date().toISOString(),
  }

  notes[noteIndex] = updatedNote
  return { ...updatedNote }
}

export async function deleteNote(id: string): Promise<boolean> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  const noteIndex = notes.findIndex((note) => note.id === id)

  if (noteIndex === -1) {
    return false
  }

  notes.splice(noteIndex, 1)
  return true
}
