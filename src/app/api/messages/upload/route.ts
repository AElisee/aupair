import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { isBlockedEitherWay } from "@/lib/messages";
import { hasActiveSubscription } from "@/lib/subscription";

const BUCKET = "message-attachments";

const ALLOWED_TYPES: Record<string, { ext: string; maxSize: number }> = {
  "image/jpeg": { ext: "jpg", maxSize: 5 * 1024 * 1024 },
  "image/png": { ext: "png", maxSize: 5 * 1024 * 1024 },
  "image/webp": { ext: "webp", maxSize: 5 * 1024 * 1024 },
  "application/pdf": { ext: "pdf", maxSize: 10 * 1024 * 1024 },
  "application/msword": { ext: "doc", maxSize: 10 * 1024 * 1024 },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: "docx", maxSize: 10 * 1024 * 1024 },
};

async function ensureBucket() {
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!data) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const myId = session.user.id;

  const formData = await req.formData();
  const file = formData.get("file");
  const receiverId = formData.get("receiverId");

  if (!(file instanceof File) || typeof receiverId !== "string" || !receiverId) {
    return NextResponse.json({ error: "Fichier et destinataire requis" }, { status: 400 });
  }
  if (receiverId === myId) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même" }, { status: 400 });
  }

  if (session.user.role === "AU_PAIR" && !(await hasActiveSubscription(myId))) {
    return NextResponse.json(
      { error: "Un abonnement actif est requis pour envoyer des messages.", code: "SUBSCRIPTION_REQUIRED" },
      { status: 403 }
    );
  }

  const typeInfo = ALLOWED_TYPES[file.type];
  if (!typeInfo) {
    return NextResponse.json({ error: "Type de fichier non supporté. Utilisez une image (JPG, PNG, WEBP) ou un document (PDF, DOC, DOCX)." }, { status: 400 });
  }
  if (file.size > typeInfo.maxSize) {
    return NextResponse.json({ error: `Le fichier dépasse la taille maximale autorisée (${Math.round(typeInfo.maxSize / 1024 / 1024)} Mo).` }, { status: 400 });
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { id: true } });
  if (!receiver) {
    return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });
  }

  if (await isBlockedEitherWay(myId, receiverId)) {
    return NextResponse.json({ error: "Impossible d'envoyer un message à cet utilisateur" }, { status: 403 });
  }

  await ensureBucket();

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${myId}/${Date.now()}-${crypto.randomUUID()}.${typeInfo.ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type });

  if (uploadError) {
    console.error("[messages/upload] Supabase upload error:", uploadError);
    return NextResponse.json({ error: "Échec de l'envoi du fichier." }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  const message = await prisma.message.create({
    data: {
      senderId: myId,
      receiverId,
      content: "",
      attachmentUrl: publicUrl,
      attachmentType: file.type,
      attachmentName: file.name,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
