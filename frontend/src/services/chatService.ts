import api from '@/lib/api';
import { Message, Conversation, User } from '@/types/chat.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface UserByEmail {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
}

export const chatService = {
  // Conversations
  async getConversations(): Promise<Conversation[]> {
    // Backend returns { conversations: [...] } without success/data wrapper
    const response = await api.get<{ conversations: any[] }>('/api/message/conversations');
    const items = response.data.conversations || [];

    const mapUser = (u: any): User => ({
      id: u.id || u._id,
      username: u.username,
      email: u.email ?? '',
      avatar: u.avatar,
      isOnline: Boolean(u.isOnline),
      lastSeen: u.lastSeen,
    });

    const mapMessage = (m: any): Message => ({
      id: m.id || m._id,
      content: m.content,
      senderId: typeof m.sender === 'object' ? (m.sender.id || m.sender._id) : m.sender,
      receiverId: typeof m.receiver === 'object' ? (m.receiver.id || m.receiver._id) : m.receiver,
      timestamp: new Date(m.timestamp).toISOString(),
      type: (m.type as Message['type']) || 'text',
      status: (m.isRead ? 'read' : 'delivered') as Message['status'],
      replyTo: typeof m.replyTo === 'object' ? (m.replyTo?.id || m.replyTo?._id) : m.replyTo,
      edited: Boolean(m.edited),
      editedAt: m.editedAt ? new Date(m.editedAt).toISOString() : undefined,
      reactions: m.reactions,
    });

    const conversations: Conversation[] = items.map((item: any) => {
      const otherUser = item.user ? mapUser(item.user) : undefined;
      const lastMessage = item.lastMessage ? mapMessage(item.lastMessage) : undefined;
      return {
        id: otherUser?.id || lastMessage?.senderId || lastMessage?.receiverId || Math.random().toString(36).slice(2),
        participants: otherUser ? [otherUser] : [],
        lastMessage,
        unreadCount: item.unreadCount ?? 0,
        updatedAt: (lastMessage?.timestamp as string) || new Date().toISOString(),
        isGroup: false,
      } as Conversation;
    });

    return conversations;
  },

  async createConversation(participants: string[]): Promise<Conversation> {
    const response = await api.post<ApiResponse<Conversation>>('/api/message/conversations', { participants });
    return response.data.data;
  },

  async findUserByEmail(email: string): Promise<UserByEmail | null> {
    try {
      const response = await api.get<ApiResponse<UserByEmail>>(`/api/message/search?email=${encodeURIComponent(email)}`);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  async createConversationWithUser(email: string): Promise<Conversation> {
    // First find the user by email
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Then create conversation with the found user ID
    const response = await api.post<ApiResponse<any>>('/api/message/conversations', { 
      participants: [user.id] 
    });

    const raw = response.data.data;

    // Normalize to a 1:1 conversation with only the other user in participants
    const otherUser: User = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      isOnline: !!user.isOnline,
    };

    const normalized: Conversation = {
      id: raw.id || user.id,
      participants: [otherUser],
      lastMessage: undefined,
      unreadCount: raw.unreadCount ?? 0,
      updatedAt: new Date().toISOString(),
      isGroup: false,
    };

    return normalized;
  },

  // Messages
  async getMessages(userId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await api.get<{ messages: any[]; pagination: any }>(`/api/message/messages`, {
      params: { userId, page, limit },
    });
    const items = response.data.messages || [];
    return items.map((m: any): Message => ({
      id: m.id || m._id,
      content: m.content,
      senderId: typeof m.sender === 'object' ? (m.sender.id || m.sender._id) : m.sender,
      receiverId: typeof m.receiver === 'object' ? (m.receiver.id || m.receiver._id) : m.receiver,
      timestamp: new Date(m.timestamp).toISOString(),
      type: (m.type as Message['type']) || 'text',
      status: (m.isRead ? 'read' : 'delivered') as Message['status'],
      replyTo: typeof m.replyTo === 'object' ? (m.replyTo?.id || m.replyTo?._id) : m.replyTo,
      edited: Boolean(m.isEdited),
      editedAt: m.editedAt ? new Date(m.editedAt).toISOString() : undefined,
      reactions: m.reactions,
    }));
  },

  async sendMessage(receiverId: string, content: string, type: Message['type'] = 'text'): Promise<Message> {
    const response = await api.post<{ message: string; data: any }>(
      '/api/message/send',
      {
        receiver: receiverId,
        content,
        type,
      }
    );
    const m = response.data.data;
    const normalized: Message = {
      id: m.id || m._id,
      content: m.content,
      senderId: typeof m.sender === 'object' ? (m.sender.id || m.sender._id) : m.sender,
      receiverId: typeof m.receiver === 'object' ? (m.receiver.id || m.receiver._id) : m.receiver,
      timestamp: new Date(m.timestamp).toISOString(),
      type: (m.type as Message['type']) || 'text',
      status: (m.isRead ? 'read' : 'delivered') as Message['status'],
      replyTo: typeof m.replyTo === 'object' ? (m.replyTo?.id || m.replyTo?._id) : m.replyTo,
      edited: Boolean(m.isEdited),
      editedAt: m.editedAt ? new Date(m.editedAt).toISOString() : undefined,
      reactions: m.reactions,
    };
    return normalized;
  },

  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await api.put<ApiResponse<Message>>(`/api/message/${messageId}`, { content });
    return response.data.data;
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/api/message/${messageId}`);
  },

  async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    const response = await api.get<ApiResponse<Message[]>>('/api/message/search', {
      params: { query, conversationId },
    });
    return response.data.data;
  },

  // Reactions
  async addReaction(messageId: string, emoji: string): Promise<void> {
    await api.post(`/api/message/${messageId}/reaction`, { emoji });
  },

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    await api.delete(`/api/message/${messageId}/reaction`, { data: { emoji } });
  },

  // File uploads
  async uploadFile(file: File, conversationId: string): Promise<{ url: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);

    const response = await api.post<ApiResponse<{ url: string; type: string }>>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};
