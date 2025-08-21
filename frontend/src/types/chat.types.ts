// Core chat types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  status: 'sent' | 'delivered' | 'read';
  reactions?: Reaction[];
  replyTo?: string;
  edited?: boolean;
  editedAt?: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isTyping: boolean;
  typingUsers: string[];
  searchQuery: string;
  isLoading: boolean;
}

// Socket events
export interface SocketEvents {
  'user:typing': { conversationId: string; userId: string };
  'user:stop_typing': { conversationId: string; userId: string };
  'message:new': { message: Message };
  'message:read': { messageId: string; userId: string };
  'message:reaction': { messageId: string; reaction: Reaction };
  'user:online': { userId: string };
  'user:offline': { userId: string };
}

// Component props
export interface ChatComponentProps {
  className?: string;
  onAction?: (action: string, data?: any) => void;
}
