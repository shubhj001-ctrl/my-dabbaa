import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const emailOtpTypes = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
  "phone_change",
  "reauthentication",
] as const;

type EmailOtpType = (typeof emailOtpTypes)[number];

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const requestedType = request.nextUrl.searchParams.get("type");

  if (
    !tokenHash ||
    !requestedType ||
    !emailOtpTypes.includes(requestedType as EmailOtpType)
  ) {
    return NextResponse.redirect(
      new URL("/login?message=confirmation-failed", request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: requestedType as EmailOtpType,
  });

  if (error) {
    console.error("[auth.confirm] Email verification failed", {
      errorName: error.name,
      errorCode: error.code,
    });
    return NextResponse.redirect(
      new URL("/login?message=confirmation-failed", request.url),
    );
  }

  const destination =
    requestedType === "recovery" ? "/reset-password" : "/home";
  return NextResponse.redirect(new URL(destination, request.url));
}
