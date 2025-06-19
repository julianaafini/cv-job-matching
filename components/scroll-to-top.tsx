"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function ScrollToTop() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Scroll to top when pathname or search params change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use "instant" instead of "smooth" for immediate scrolling
    })
  }, [pathname, searchParams]) // Add searchParams as a dependency to detect query parameter changes

  return null
}
