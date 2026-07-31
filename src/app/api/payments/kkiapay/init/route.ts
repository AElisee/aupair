import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "KKiaPay a été remplacé par SebPay. Utilisez /api/payments/sebpay." }, { status: 410 });
}
