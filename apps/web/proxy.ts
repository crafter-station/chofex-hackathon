import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerk = clerkMiddleware();

function isPublicMarketingPath(pathname: string) {
  if (
    pathname === "/" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/opengraph-image" ||
    pathname === "/twitter-image"
  ) {
    return true;
  }

  if (pathname.startsWith("/models/")) {
    return true;
  }

  return pathname.startsWith("/terms/") || pathname.startsWith("/privacy/");
}

export default function proxy(...args: Parameters<typeof clerk>) {
  const request = args[0];

  if (request && isPublicMarketingPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  return clerk(...args);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|glb)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
