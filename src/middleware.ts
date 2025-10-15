import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

// Paths where middleware will run
export const config = {
  matcher: ["/login"],
};
