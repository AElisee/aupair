import { NextResponse } from "next/server";
import { getCountriesByType } from "@/lib/countries";
import { CountryType } from "@/generated/prisma/client";

export async function GET() {
  const [origin, host] = await Promise.all([
    getCountriesByType(CountryType.ORIGIN),
    getCountriesByType(CountryType.HOST),
  ]);

  const toDto = (c: { name: string; flag: string; dialCode: string }) => ({
    name: c.name,
    flag: c.flag,
    dialCode: c.dialCode,
  });

  return NextResponse.json({
    origin: origin.map(toDto),
    host: host.map(toDto),
  });
}
