import { io, Socket } from 'socket.io-client';
import { Message } from '@/types/chat.types';

interface SocketService {
  socket: Socket | null;
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (data: any) => void;
  onMessageReceived: (callback: (message: Message) => void) => void;
  onMessageSent: (callback: (message: Message) => void) => void;
  onUserTyping: (callback: (data: { sender: string; isTyping: boolean }) => void) => void;
  onUserStatusChanged: (callback: (data: { userId: string; isOnline: boolean }) => void) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  startTyping: (data: { receiver: string; conversationId: string }) => void;
  stopTyping: (data: { receiver: string; conversationId: string }) => void;
  updateStatus: (isOnline: boolean) => void;
  addUserToConversation: (data: { conversationId: string; userId: string }) => void;
}

class RealtimeSocketService implements SocketService {
  socket: Socket | null = null;

  connect(token: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server via WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(data: any) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  onMessageReceived(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onMessageSent(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }

  onUserTyping(callback: (data: { sender: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStatusChanged(callback: (data: { userId: string; isOnline: boolean }) => void) {
    if (this.socket) {
      this.socket.on('user_status_changed', callback);
    }
  }

  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  startTyping(data: { receiver: string; conversationId: string }) {
    if (this.socket) {
      this.socket.emit('typing_start', data);
    }
  }

  stopTyping(data: { receiver: string; conversationId: string }) {
    if (this.socket) {
      this.socket.emit('typing_stop', data);
    }
  }

  updateStatus(isOnline: boolean) {
    if (this.socket) {
      this.socket.emit('update_status', { isOnline });
    }
  }

  addUserToConversation(data: { conversationId: string; userId: string }) {
    if (this.socket) {
      this.socket.emit('add_user_to_conversation', data);
    }
  }
}

export const socketService = new RealtimeSocketService();
