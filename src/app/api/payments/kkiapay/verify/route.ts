import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "KKiaPay a été remplacé par SebPay. Utilisez /api/payments/sebpay/verify." }, { status: 410 });
}
