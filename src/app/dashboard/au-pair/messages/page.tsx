"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MessagesPanel from "@/components/messages/MessagesPanel";

export default function MessagesPage() {
  return (
    <DashboardLayout role="au-pair">
      <Suspense>
        <MessagesPanel role="au-pair" />
      </Suspense>
    </DashboardLayout>
  );
}
