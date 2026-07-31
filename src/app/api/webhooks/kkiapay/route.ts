import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "KKiaPay a été remplacé par SebPay. Utilisez /api/webhooks/sebpay." }, { status: 410 });
}
