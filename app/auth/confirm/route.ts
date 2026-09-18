import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const supabase = await createClient();
  const code = params.get("code");
  const hash = params.get("token_hash");
  const type = params.get("type");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/", request.url));
  } else if (hash && type === "signup") {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: hash,
      type: type as EmailOtpType,
    });
    if (!error) return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.redirect(
    new URL("/login?confirmation=error", request.url),
  );
}
