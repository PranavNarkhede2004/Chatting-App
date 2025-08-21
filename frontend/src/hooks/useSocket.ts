import { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socketService';
import { Message } from '@/types/chat.types';
import { authService } from '@/services/authService';

interface UseSocketReturn {
  isConnected: boolean;
  sendMessage: (data: any) => void;
  startTyping: (receiver: string, conversationId: string) => void;
  stopTyping: (receiver: string, conversationId: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  addUserToConversation: (conversationId: string, userId: string) => void;
  updateStatus: (isOnline: boolean) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const authData = authService.getAuthData();
    if (authData) {
      setUser(authData.user);
      setToken(authData.token);
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      socketService.connect(token);
      setIsConnected(true);

      // Join user's personal room
      socketService.joinConversation(`user_${user.id}`);

      // Update online status
      socketService.updateStatus(true);

      return () => {
        socketService.updateStatus(false);
        socketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [token, user]);

  const sendMessage = useCallback((data: any) => {
    socketService.sendMessage(data);
  }, []);

  const startTyping = useCallback((receiver: string, conversationId: string) => {
    socketService.startTyping({ receiver, conversationId });
  }, []);

  const stopTyping = useCallback((receiver: string, conversationId: string) => {
    socketService.stopTyping({ receiver, conversationId });
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketService.leaveConversation(conversationId);
  }, []);

  const addUserToConversation = useCallback((conversationId: string, userId: string) => {
    socketService.addUserToConversation({ conversationId, userId });
  }, []);

  const updateStatus = useCallback((isOnline: boolean) => {
    socketService.updateStatus(isOnline);
  }, []);

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    joinConversation,
    leaveConversation,
    addUserToConversation,
    updateStatus,
  };
};

// Hook for handling real-time messages
export const useRealtimeMessages = (conversationId: string, onNewMessage: (message: Message) => void) => {
  useEffect(() => {
    if (conversationId) {
      socketService.joinConversation(conversationId);

      const handleNewMessage = (message: Message) => {
        onNewMessage(message);
      };

      socketService.onMessageReceived(handleNewMessage);

      return () => {
        socketService.leaveConversation(conversationId);
      };
    }
  }, [conversationId, onNewMessage]);
};

// Hook for handling typing indicators
export const useTypingIndicator = (conversationId: string, onTypingChange: (data: { sender: string; isTyping: boolean }) => void) => {
  useEffect(() => {
    const handleTyping = (data: { sender: string; isTyping: boolean }) => {
      onTypingChange(data);
    };

    socketService.onUserTyping(handleTyping);

    return () => {
      // Cleanup listeners
    };
  }, [conversationId, onTypingChange]);
};

// Hook for handling online status
export const useOnlineStatus = (onStatusChange: (data: { userId: string; isOnline: boolean }) => void) => {
  useEffect(() => {
    const handleStatusChange = (data: { userId: string; isOnline: boolean }) => {
      onStatusChange(data);
    };

    socketService.onUserStatusChanged(handleStatusChange);

    return () => {
      // Cleanup listeners
    };
  }, [onStatusChange]);
};
