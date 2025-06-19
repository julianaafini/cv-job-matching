"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"

function SearchComponent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  return <Input type="search" placeholder="Search..." defaultValue={query} className="max-w-sm" />
}

export function SearchWithSuspense() {
  return (
    <Suspense fallback={<Input type="search" placeholder="Loading..." disabled className="max-w-sm" />}>
      <SearchComponent />
    </Suspense>
  )
}
