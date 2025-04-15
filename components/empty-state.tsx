import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted rounded-full p-4 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-2">No notes yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Create your first note to get started. You can add text, images, and other files to your notes.
      </p>
      <Link href="/notes/new">
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Note</span>
        </Button>
      </Link>
    </div>
  )
}
