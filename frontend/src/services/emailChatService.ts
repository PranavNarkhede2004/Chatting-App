import api from '@/lib/api';
import { Message } from '@/types/chat.types';

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

interface CreateUserResponse {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export const emailChatService = {
  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate username format
  validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username) && username.length >= 3 && username.length <= 30;
  },

  // Check if user exists by email
  async checkUserExists(email: string): Promise<{
    exists: boolean;
    data: UserByEmail | null;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        exists: boolean;
        data: UserByEmail | null;
      }>>(`/api/message/check-user?email=${encodeURIComponent(email)}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check user existence');
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<UserByEmail | null> {
    try {
      const response = await api.get<ApiResponse<UserByEmail>>(`/api/message/search?email=${encodeURIComponent(email)}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Create new user by email
  async createUserByEmail(email: string, username: string): Promise<CreateUserResponse> {
    try {
      const response = await api.post<ApiResponse<CreateUserResponse>>('/api/message/create-user', {
        email,
        username,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  // Send message by email
  async sendMessageByEmail(recipientEmail: string, content: string, type: Message['type'] = 'text'): Promise<Message> {
    try {
      const response = await api.post<ApiResponse<Message>>('/api/message/send-by-email', {
        recipientEmail,
        content,
        type,
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        throw new Error('User with this email not found. Please check the email address or create a new user.');
      }
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  // Get conversation by email
  async getConversationByEmail(email: string, page = 1, limit = 50): Promise<{
    messages: Message[];
    otherUser: UserByEmail;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalMessages: number;
      hasMore: boolean;
    };
  }> {
    try {
      const response = await api.get<ApiResponse<any>>(`/api/message/conversation/email/${email}`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message === 'User not found') {
        throw new Error('User with this email not found. Please check the email address.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch conversation');
    }
  },

  // Upload file for email chat
  async uploadFile(file: File, email: string): Promise<{ url: string; type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', email);

    const response = await api.post<ApiResponse<{ url: string; type: string }>>('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};
