import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // You can add custom logic here for handling 404s or other routes
  return NextResponse.next()
}

export const config = {
  // Skip all paths that should be handled by static files, api routes, or other middleware
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
