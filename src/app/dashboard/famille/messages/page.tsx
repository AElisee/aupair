"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MessagesPanel from "@/components/messages/MessagesPanel";

export default function MessagesPage() {
  return (
    <DashboardLayout role="famille">
      <Suspense>
        <MessagesPanel role="famille" />
      </Suspense>
    </DashboardLayout>
  );
}
