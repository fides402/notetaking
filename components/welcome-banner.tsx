"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(true)

  // Check if the banner has been dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem("welcomeBannerDismissed")
    if (dismissed === "true") {
      setIsVisible(false)
    }
  }, [])

  const dismissBanner = () => {
    setIsVisible(false)
    localStorage.setItem("welcomeBannerDismissed", "true")
  }

  if (!isVisible) {
    return null
  }

  return (
    <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 border-teal-200 dark:border-teal-800">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold mb-2">Welcome to NotionKeep!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Create notes, upload files, and get AI-powered insights on your content.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="default">
                Create Your First Note
              </Button>
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={dismissBanner}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
