import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role;

    const isAdminRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/publish");

    const isChampionRoute = pathname.startsWith("/champion");

    if (isAdminRoute && role !== "AI_TECH_TEAM") {
      return NextResponse.redirect(new URL("/champion", req.url));
    }

    if (isChampionRoute && role !== "AI_CHAMPION" && role !== "AI_TECH_TEAM") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/champion/:path*",
    "/publish/:path*",
    "/projects/:path*",
    "/account/:path*",
  ],
};
