import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const userCookie = request.cookies.get("user_data")?.value;
  const { pathname } = request.nextUrl;

  // Public routes (accessible without login)
  const publicRoutes = ["/login", "/otp", "/new-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Protected routes (require authentication)
  const protectedRoutes = ["/inventory", "/admin"];

  // 1️⃣ If token not present and user tries to access protected route
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2️⃣ If token exists and user tries to access public routes (e.g. login)
  if (token && isPublicRoute) {
    let userType: string | null = null;

    try {
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie);
        userType = parsedUser?.userType || null;
      }
    } catch (err) {
      console.error("Invalid user cookie:", err);
    }

    // Redirect logged-in user to their dashboard
    if (userType === "admin") {
      return NextResponse.redirect(new URL("/admin/doctors", request.url));
    } else if (userType === "doctor") {
      return NextResponse.redirect(new URL("/inventory?page=0", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3️⃣ Otherwise, allow access
  return NextResponse.next();
}

// ✅ Apply middleware globally (or restrict as needed)
export const config = {
  matcher: [
    "/login",
    "/otp",
    "/new-password",
    "/inventory/:path*",
    "/admin/:path*",
  ],
};
