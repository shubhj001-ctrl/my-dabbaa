import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import {
  createAdminClient,
  isSupabaseServiceRoleConfigured,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const FILE_TYPES = {
  "image/jpeg": { extension: "jpg", signature: [0xff, 0xd8, 0xff] },
  "image/png": {
    extension: "png",
    signature: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  "image/webp": { extension: "webp", signature: [0x52, 0x49, 0x46, 0x46] },
} as const;

export async function POST(
  request: Request,
  { params }: RouteContext<"/api/provider/kitchens/[id]/photos">,
) {
  const { id } = await params;
  if (!/^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid kitchen." }, { status: 400 });
  }

  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile || profile.role !== "provider" || !profile.is_active) {
    return NextResponse.json({ error: "Sign in with a provider account." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (file.size < 1 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Images must be 4 MB or smaller." }, { status: 400 });
  }
  const type = FILE_TYPES[file.type as keyof typeof FILE_TYPES];
  if (!type) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WebP image." }, { status: 415 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const signatureMatches = type.signature.every((byte, index) => bytes[index] === byte);
  const webpSignatureMatches =
    file.type !== "image/webp" ||
    (String.fromCharCode(...bytes.slice(8, 12)) === "WEBP");
  if (!signatureMatches || !webpSignatureMatches) {
    return NextResponse.json({ error: "The file content does not match its image type." }, { status: 415 });
  }

  const supabase = await createClient();
  const { data: kitchen, error: kitchenError } = await supabase
    .from("kitchens")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (kitchenError || !kitchen) {
    return NextResponse.json({ error: "Kitchen not found." }, { status: 404 });
  }

  if (!isSupabaseServiceRoleConfigured()) {
    return NextResponse.json({ error: "Kitchen image uploads are not configured yet." }, { status: 503 });
  }
  const storageAdmin = createAdminClient();
  const path = `${id}/${randomUUID()}.${type.extension}`;
  const { error: uploadError } = await storageAdmin.storage
    .from("kitchen-images")
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) {
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 400 });
  }

  return NextResponse.json({ path });
}
