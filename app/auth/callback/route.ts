import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function getBaseUrl(request: Request, origin: string): string {
  // Priority order:
  // 1. Configured NEXT_PUBLIC_SITE_URL
  // 2. Forwarded host from load balancer (production)
  // 3. Original request origin
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (baseUrl) return baseUrl;

  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return `${protocol}://${forwardedHost}`;
  }

  return origin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const baseUrl = getBaseUrl(request, origin);

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(
    `${baseUrl}${error ? "/auth/auth-code-error" : next}`
  );
}
