// Supabase Edge Function runtime uses Deno and is type-checked by the Supabase CLI.
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

type EmailHookEvent = {
  user?: {
    email?: string;
    new_email?: string;
  };
  email_data?: {
    email_action_type?: string;
    token?: string;
    token_new?: string;
    token_hash?: string;
    token_hash_new?: string;
  };
};

const actionLabels: Record<string, string> = {
  signup: "Confirm your My Dabbaa account",
  invite: "Accept your My Dabbaa invitation",
  magiclink: "Sign in to My Dabbaa",
  recovery: "Reset your My Dabbaa password",
  email_change: "Confirm your My Dabbaa email change",
  email: "Confirm your My Dabbaa email",
  phone_change: "Confirm your My Dabbaa phone change",
  reauthentication: "Confirm this My Dabbaa security request",
};

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function readHookSecret() {
  const configured = requiredEnv("SEND_EMAIL_HOOK_SECRETS");
  const secret = configured.split("|")[0].trim();
  if (!secret.startsWith("v1,whsec_")) {
    throw new Error("Invalid Send Email Hook secret format");
  }
  return secret.slice("v1,whsec_".length);
}

function makeConfirmationUrl(tokenHash: string, type: string) {
  const appUrl = new URL(requiredEnv("APP_SITE_URL"));
  if (appUrl.protocol !== "https:" && appUrl.hostname !== "localhost") {
    throw new Error("APP_SITE_URL must use HTTPS");
  }

  const confirmationUrl = new URL("/auth/confirm", appUrl);
  confirmationUrl.searchParams.set("token_hash", tokenHash);
  confirmationUrl.searchParams.set("type", type);
  return confirmationUrl.toString();
}

async function sendEmail(
  recipient: string,
  actionType: string,
  token?: string,
  tokenHash?: string,
) {
  const serviceId = requiredEnv("EMAILJS_SERVICE_ID");
  const templateId = requiredEnv("EMAILJS_TEMPLATE_ID");
  const publicKey = requiredEnv("EMAILJS_PUBLIC_KEY");
  const privateKey = requiredEnv("EMAILJS_PRIVATE_KEY");
  const confirmationUrl = tokenHash && actionType !== "signup"
    ? makeConfirmationUrl(tokenHash, actionType)
    : "";

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        to_email: recipient,
        confirmation_url: confirmationUrl,
        action_label: actionLabels[actionType],
        app_name: "My Dabbaa",
        otp_code: token ?? "",
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    console.error("[send-auth-email] EmailJS rejected the send", {
      status: response.status,
      actionType,
    });
    throw new Error("Email provider rejected the message");
  }
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let event: EmailHookEvent;
  try {
    const body = await request.text();
    const webhook = new Webhook(readHookSecret());
    event = webhook.verify(body, Object.fromEntries(request.headers)) as EmailHookEvent;
  } catch {
    return new Response("Unauthorized", { status: 401 });
  }

  const actionType = event.email_data?.email_action_type;
  if (!actionType || !actionLabels[actionType]) {
    console.error("[send-auth-email] Unsupported email action", {
      actionType: actionType ?? "missing",
    });
    return new Response("Unsupported email action", { status: 400 });
  }

  const emailData = event.email_data;
  const user = event.user;
  if (!emailData || !user) {
    return new Response("Invalid email event", { status: 400 });
  }

  try {
    if (actionType === "email_change" && emailData.token_hash_new) {
      if (!user.email) return new Response("Missing recipient", { status: 400 });
      await sendEmail(
        user.email,
        actionType,
        emailData.token,
        emailData.token_hash_new,
      );
      if (user.new_email && emailData.token_hash) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
        await sendEmail(
          user.new_email,
          actionType,
          emailData.token_new,
          emailData.token_hash,
        );
      }
    } else {
      const recipient =
        actionType === "email_change" ? user.new_email : user.email;
      const tokenHash = emailData.token_hash;
      const token = emailData.token;
      if (!recipient || (!tokenHash && !token)) {
        return new Response("Missing email confirmation data", { status: 400 });
      }
      await sendEmail(recipient, actionType, token, tokenHash);
    }

    return new Response(null, { status: 200 });
  } catch {
    console.error("[send-auth-email] Email delivery failed", { actionType });
    return new Response("Email delivery failed", { status: 500 });
  }
});
