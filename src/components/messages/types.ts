export interface ConversationSummary {
  userId: string;
  name: string;
  avatar: string | null;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

export interface MessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  status: string;
  createdAt: string;
}

export interface OtherUser {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}
