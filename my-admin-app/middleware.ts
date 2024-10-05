import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ALLOWED_ORIGINS = [
  "http://localhost:3001/",
  "http://localhost:3000/",
  "https://www.ita-luxury.com",
  "https://admin.ita-luxury.com",
  `${process.env.NEXT_PUBLIC_BASE_URL_DOMAIN}`,
  `${process.env.NEXT_PUBLIC_ADMIN_URL}`,
];

const publicRoutes = ["/signin", "/signup"]; 

export async function middleware(req: any) {
  const res = NextResponse.next();
  const url = req.nextUrl.pathname;
  const token = req.cookies.get("AdminToken")?.value;

  const origin = req.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
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
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    console.log(payload.role);

    if (payload.role !== "ADMIN") {
      // If the user is not an admin, redirect to an unauthorized page or the home page
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
