import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const userCookie = request.cookies.get("user_data")?.value;
  const { pathname } = request.nextUrl;

  // Public routes (accessible without login)
  const publicRoutes = [
    "/login",
    "/otp",
    "/new-password",
    "/accept-invitation",
  ];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Role-based route definitions
  const adminRoutes = ["/admin"];
  const doctorRoutes = ["/inventory", "/customers", "/orders", "/requests", "/notifications", "/reminder", "/settings"];
  const customerRoutes = ["/browse-products", "/chat", "/customer-requests", "/order-history", "/pending-payments", "/profile"];

  // All protected routes
  const protectedRoutes = [...adminRoutes, ...doctorRoutes, ...customerRoutes];

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
        userType = parsedUser?.userType?.toLowerCase() || null;
      }
    } catch (err) {
      console.error("Invalid user cookie:", err);
    }

    // Redirect logged-in user to their dashboard
    if (userType === "admin") {
      return NextResponse.redirect(new URL("/admin/doctors", request.url));
    } else if (userType === "doctor") {
      return NextResponse.redirect(new URL("/inventory", request.url));
    } else if (userType === "customer" || userType === "patient") {
      return NextResponse.redirect(new URL("/pending-payments", request.url));
    } else {
      return NextResponse.redirect(new URL("/pending-payments", request.url));
    }
  }

  // 3️⃣ Role-based access control for protected routes
  if (token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    let userType: string | null = null;

    try {
      if (userCookie) {
        const parsedUser = JSON.parse(userCookie);
        userType = parsedUser?.userType?.toLowerCase() || null;
      }
    } catch (err) {
      console.error("Invalid user cookie:", err);
    }

    // Check if user is trying to access routes they're not authorized for
    if (userType === "admin" && doctorRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/admin/doctors", request.url));
    }
    
    if (userType === "admin" && customerRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/admin/doctors", request.url));
    }

    if (userType === "doctor" && adminRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/inventory", request.url));
    }
    
    if (userType === "doctor" && customerRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/inventory", request.url));
    }

    if ((userType === "customer" || userType === "patient") && adminRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/pending-payments", request.url));
    }
    
    if ((userType === "customer" || userType === "patient") && doctorRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/pending-payments", request.url));
    }
  }

  // 4️⃣ Otherwise, allow access
  return NextResponse.next();
}

// ✅ Apply middleware globally (or restrict as needed)
export const config = {
  matcher: [
    "/login",
    "/otp",
    "/new-password",
    "/accept-invitation",
    "/inventory/:path*",
    "/admin/:path*",
    "/customers/:path*",
    "/orders/:path*",
    "/requests/:path*",
    "/notifications/:path*",
    "/reminder/:path*",
    "/settings/:path*",
    "/browse-products/:path*",
    "/chat/:path*",
    "/customer-requests/:path*",
    "/order-history/:path*",
    "/pending-payments/:path*",
    "/profile/:path*",
  ],
};
