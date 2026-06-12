import { prisma } from "./prisma";

export type NotificationType = "PROFILE_VIEW" | "WEEKLY_VIEWS_DIGEST";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
}

export async function createNotification({ userId, type, title, content, link }: CreateNotificationInput) {
  await prisma.notification.create({
    data: { userId, type, title, content, link },
  });
}
