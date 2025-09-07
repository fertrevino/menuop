import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const forwardedProto = request.headers.get("x-forwarded-proto"); // original protocol
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

      if (baseUrl) {
        // If we have a configured site URL, use it
        return NextResponse.redirect(`${baseUrl}${next}`);
      } else if (process.env.NODE_ENV === "development") {
        // In development, use the original origin
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        // In production with a load balancer, use the forwarded host
        const protocol = forwardedProto || "https";
        return NextResponse.redirect(`${protocol}://${forwardedHost}${next}`);
      } else {
        // Fallback to the original origin
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
