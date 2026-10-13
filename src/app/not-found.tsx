import type { Metadata } from "next";
import NotFoundView from "@/components/layout/NotFoundView";

export const metadata: Metadata = {
  title: "Page introuvable / Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return <NotFoundView />;
}
