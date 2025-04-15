import { NextResponse } from "next/server"
import { createNote, getAllNotes } from "@/lib/notes"
import type { Note } from "@/lib/types"

export async function GET() {
  try {
    const notes = await getAllNotes()
    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newNote = await createNote(data as Omit<Note, "id" | "createdAt" | "updatedAt">)
    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}
