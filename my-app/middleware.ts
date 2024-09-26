import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const allowedOrigins = [
  "http://localhost:3001/",
  "http://localhost:3000/",
  `${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}/`,
];

const adminRoutes = ["/api/admin", "/Dashboard"]; // Add all admin-only routes here
const publicRoutes = ["/signin", "/signup"]; // Add all public routes here

export async function middleware(req: any) {
  const res = NextResponse.next();
  const url = req.nextUrl.pathname;
  const token = req.cookies.get("AdminToken")?.value;

  // Allow access to public routes without a token
  if (publicRoutes.includes(url)) {
    if (token && url === "/signin") {
      return NextResponse.redirect(new URL("/Dashboard", req.url));
    }
    return res;
  }

  // Check for token on all other routes
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Verify token for admin routes
  if (adminRoutes.some(route => url.startsWith(route))) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      console.log(payload.role );

      if (payload.role !== "ADMIN") {
        // If the user is not an admin, redirect to an unauthorized page or the home page
        return NextResponse.redirect(new URL("/Dashboard?unauthorized=true", req.url));
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};