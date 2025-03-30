import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Define allowed origins with proper typing
const ALLOWED_ORIGINS: string[] = [
  "http://localhost:4001",
  "http://localhost:4000",
  "https://www.ita-luxury.com",
  "https://admin.ita-luxury.com",
  process.env.NEXT_PUBLIC_BASE_URL_DOMAIN,
  process.env.NEXT_PUBLIC_ADMIN_URL,
].filter(Boolean) as string[];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/signin", "/signup"];

// Define error messages for better debugging
const ERROR_MESSAGES = {
  NO_TOKEN: "No authentication token found",
  INVALID_TOKEN: "Invalid or expired authentication token",
  NOT_ADMIN: "User does not have admin privileges",
  NO_SECRET: "JWT secret is not configured",
};

// Add a type definition for the JWT payload
interface JWTPayload {
  userId?: string;
  role?: string;
  [key: string]: any;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl.pathname;
  const token = req.cookies.get("AdminToken")?.value;

  // Handle CORS preflight requests
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

  // Set CORS headers for all other requests
  const origin = req.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle public routes
  if (PUBLIC_ROUTES.some(route => url.startsWith(route))) {
    // Redirect to dashboard if already authenticated and trying to access signin
    if (token && url === "/signin") {
      return NextResponse.redirect(new URL("/Dashboard", req.url));
    }
    return res;
  }

  // Check for authentication token
  if (!token) {
    console.log(ERROR_MESSAGES.NO_TOKEN);
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    // Verify JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error(ERROR_MESSAGES.NO_SECRET);
      return NextResponse.redirect(new URL("/signin", req.url));
    }
    
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    
    // Cast the payload to our interface type
    const userPayload = payload as unknown as JWTPayload;
    
    // Check admin role
    if (userPayload.role !== "ADMIN") {
      console.log(ERROR_MESSAGES.NOT_ADMIN);
      return NextResponse.redirect(
        new URL("/Dashboard?unauthorized=true", req.url)
      );
    }
    
    // Add user info to request headers for downstream use if needed
    res.headers.set("X-User-Id", userPayload.userId || "");
    res.headers.set("X-User-Role", userPayload.role || "");
    
  } catch (error) {
    console.error(ERROR_MESSAGES.INVALID_TOKEN, error);
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};