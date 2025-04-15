import { Suspense } from "react"
import NoteList from "@/components/note-list"
import WelcomeBanner from "@/components/welcome-banner"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import Loading from "./loading"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">NotionKeep</h1>
          <Link href="/notes/new">
            <Button className="flex items-center gap-2">
              <PlusIcon size={16} />
              <span>New Note</span>
            </Button>
          </Link>
        </div>

        <WelcomeBanner />

        <div className="w-full max-w-xl">
          <SearchInput />
        </div>

        <Suspense fallback={<Loading />}>
          <NoteList />
        </Suspense>
      </div>
    </main>
  )
}
