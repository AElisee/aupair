import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";

export async function POST(req: Request) {
  if (!process.env.CINETPAY_API_KEY || !process.env.CINETPAY_SITE_ID) {
    return NextResponse.json({ error: "CinetPay n'est pas configuré." }, { status: 503 });
  }

  const formData = await req.formData();
  const transactionId = formData.get("cpm_trans_id")?.toString();

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction manquante" }, { status: 400 });
  }

  const verifyRes = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
    }),
  });

  const result = await verifyRes.json();

  if (result.code === "00" && result.data?.status === "ACCEPTED") {
    const userId = transactionId.split("-")[0];

    const existing = await prisma.subscription.findFirst({
      where: { paymentId: transactionId },
    });

    if (!existing) {
      const settings = await getAppSettings();
      const now = new Date();
      await prisma.subscription.create({
        data: {
          userId,
          status: "ACTIVE",
          amount: Number(result.data.amount),
          currency: "XOF",
          paymentMethod: "MOBILE_MONEY",
          paymentId: transactionId,
          startsAt: now,
          expiresAt: new Date(now.getTime() + settings.subscriptionDays * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
