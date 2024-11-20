import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ALLOWED_ORIGINS = [
  "http://localhost:4001",
  "http://localhost:4000",
  "https://www.ita-luxury.com",
  "https://admin.ita-luxury.com",
  process.env.NEXT_PUBLIC_BASE_URL_DOMAIN,
  process.env.NEXT_PUBLIC_ADMIN_URL,
].filter(Boolean);

const publicRoutes = ["/signin", "/signup"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl.pathname;
  const token = req.cookies.get("AdminToken")?.value;

  // CORS Preflight Handling
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get("origin");
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Credentials': 'true',
        }
      });
    }
  }

  // CORS handling for all requests
  const origin = req.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Allow access to public routes without a token
  if (publicRoutes.includes(url)) {
    if (token && url === "/signin") {
      return NextResponse.redirect(new URL("/Dashboard", req.url));
    }
    return res;
  }

  // Check for token on all other routes
  if (!token) {
    console.log("No token found, redirecting to signin");
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }
    
    const { payload } = await jwtVerify(token, secret);
    console.log("Token verified, user role:", payload.role);

    if (payload.role !== "ADMIN") {
      console.log("User is not an admin, redirecting to unauthorized page");
      return NextResponse.redirect(
        new URL("/Dashboard?unauthorized=true", req.url)
      );
    }
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};