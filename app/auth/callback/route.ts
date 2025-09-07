import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function getBaseUrl(request: Request, origin: string): string {
  // Priority order:
  // 1. Configured NEXT_PUBLIC_SITE_URL
  // 2. Forwarded host from load balancer (production)
  // 3. Original request origin

  console.log("DEBUG Auth Callback - Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  console.log("DEBUG Auth Callback - Request Headers:", {
    "x-forwarded-host": request.headers.get("x-forwarded-host"),
    "x-forwarded-proto": request.headers.get("x-forwarded-proto"),
    host: request.headers.get("host"),
    origin: origin,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (baseUrl) {
    console.log("DEBUG Auth Callback - Using NEXT_PUBLIC_SITE_URL:", baseUrl);
    return baseUrl;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const url = `${protocol}://${forwardedHost}`;
    console.log("DEBUG Auth Callback - Using forwarded host:", url);
    return url;
  }

  console.log("DEBUG Auth Callback - Using origin:", origin);
  return origin;
}

export async function GET(request: Request) {
  console.log("DEBUG Auth Callback - Incoming Request:", {
    url: request.url,
    method: request.method,
  });

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("DEBUG Auth Callback - Parameters:", {
    code: code ? "present" : "missing",
    next,
    origin,
  });

  const baseUrl = getBaseUrl(request, origin);

  if (!code) {
    const errorUrl = `${baseUrl}/auth/auth-code-error`;
    console.log("DEBUG Auth Callback - No code, redirecting to:", errorUrl);
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("DEBUG Auth Callback - Auth Result:", {
    error: error ? error.message : "none",
  });

  const redirectUrl = `${baseUrl}${error ? "/auth/auth-code-error" : next}`;
  console.log("DEBUG Auth Callback - Final Redirect:", redirectUrl);

  return NextResponse.redirect(redirectUrl);
}
