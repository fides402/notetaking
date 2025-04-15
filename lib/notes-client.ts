import type { Note } from "./types"

export async function createNote(noteData: Omit<Note, "id" | "createdAt" | "updatedAt">): Promise<Note> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  })

  if (!response.ok) {
    throw new Error("Failed to create note")
  }

  return response.json()
}

export async function updateNote(
  id: string,
  noteData: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>,
): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  })

  if (!response.ok) {
    throw new Error("Failed to update note")
  }

  return response.json()
}

export async function deleteNote(id: string): Promise<boolean> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete note")
  }

  return true
}
