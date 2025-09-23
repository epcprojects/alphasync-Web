import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    // const token = request.cookies.get("admin-token")?.value;

    // console.log(token);
    

    // if (!token) {
      // Add params
      const url = new URL("/login", request.url);
      url.searchParams.set("redirectedFrom", 'admin');

      return NextResponse.redirect(url);
    // }
  }

  return NextResponse.next();
}

// Paths where middleware will run
export const config = {
 matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ]
};
