'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatState, Message, Conversation, User } from '@/types/chat.types';
import { chatService } from '@/services/chatService';

export function useChat() {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isTyping: false,
    typingUsers: [],
    searchQuery: '',
    isLoading: false,
  });

  const socketRef = useRef<Socket | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    // Load current user id
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const parsed = JSON.parse(userJson);
        setCurrentUserId(parsed.id || parsed._id || null);
      }
    } catch (e) {
      // ignore
    }

    const token = localStorage.getItem('token');
    if (token) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        auth: { token },
      });

      // Socket event listeners
      socketRef.current.on('message:new', handleNewMessage);
      socketRef.current.on('user:typing', handleUserTyping);
      socketRef.current.on('user:stop_typing', handleUserStopTyping);
      socketRef.current.on('message:read', handleMessageRead);
      socketRef.current.on('user:online', handleUserOnline);
      socketRef.current.on('user:offline', handleUserOffline);

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const conversations = await chatService.getConversations();
        setState(prev => ({ ...prev, conversations, isLoading: false }));
      } catch (error) {
        console.error('Error loading conversations:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadConversations();
  }, []);

  const handleNewMessage = useCallback((data: { message: Message }) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, data.message],
    }));
  }, []);

  const handleUserTyping = useCallback((data: { conversationId: string; userId: string }) => {
    setState(prev => ({
      ...prev,
      typingUsers: [...prev.typingUsers, data.userId],
    }));
  }, []);

  const handleUserStopTyping = useCallback((data: { conversationId: string; userId: string }) => {
    setState(prev => ({
      ...prev,
      typingUsers: prev.typingUsers.filter(id => id !== data.userId),
    }));
  }, []);

  const handleMessageRead = useCallback((data: { messageId: string; userId: string }) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg =>
        msg.id === data.messageId ? { ...msg, status: 'read' } : msg
      ),
    }));
  }, []);

  const handleUserOnline = useCallback((data: { userId: string }) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => ({
        ...conv,
        participants: conv.participants.map(user =>
          user.id === data.userId ? { ...user, isOnline: true } : user
        ),
      })),
    }));
  }, []);

  const handleUserOffline = useCallback((data: { userId: string }) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => ({
        ...conv,
        participants: conv.participants.map(user =>
          user.id === data.userId ? { ...user, isOnline: false } : user
        ),
      })),
    }));
  }, []);

  // Actions
  const sendMessage = useCallback(async (content: string, type: Message['type'] = 'text') => {
    if (!state.activeConversation) return;
    // For 1:1 chats, the conversation id is the other user's id
    const otherUserId = state.activeConversation.participants[0]?.id;
    if (!otherUserId) return;

    try {
      const sent = await chatService.sendMessage(otherUserId, content, type);
      setState(prev => {
        // Append to messages
        const updatedMessages = [...prev.messages, sent];
        // Update conversations: bump active conversation with new lastMessage
        const updatedConversations = (() => {
          const existingIndex = prev.conversations.findIndex(c => c.id === prev.activeConversation?.id);
          const updated = [...prev.conversations];
          if (existingIndex >= 0) {
            updated[existingIndex] = {
              ...updated[existingIndex],
              lastMessage: sent,
              updatedAt: sent.timestamp,
            } as any;
            // Move to top
            const [item] = updated.splice(existingIndex, 1);
            updated.unshift(item);
          } else if (prev.activeConversation) {
            updated.unshift({ ...prev.activeConversation, lastMessage: sent, updatedAt: sent.timestamp } as any);
          }
          return updated;
        })();
        return { ...prev, messages: updatedMessages, conversations: updatedConversations };
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [state.activeConversation]);

  const startTyping = useCallback(() => {
    if (!state.activeConversation || !socketRef.current) return;
    
    socketRef.current.emit('user:typing', {
      conversationId: state.activeConversation.id,
    });
  }, [state.activeConversation]);

  const stopTyping = useCallback(() => {
    if (!state.activeConversation || !socketRef.current) return;
    
    socketRef.current.emit('user:stop_typing', {
      conversationId: state.activeConversation.id,
    });
  }, [state.activeConversation]);

  const markAsRead = useCallback((messageId: string) => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('message:read', { messageId });
  }, []);

  const setActiveConversation = useCallback((conversation: Conversation | null) => {
    setState(prev => ({ ...prev, activeConversation: conversation }));
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    const load = async () => {
      if (!state.activeConversation) {
        setState(prev => ({ ...prev, messages: [] }));
        return;
      }
      const otherUserId = state.activeConversation.participants[0]?.id;
      if (!otherUserId) return;
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const msgs = await chatService.getMessages(otherUserId, 1, 50);
        setState(prev => ({ ...prev, messages: msgs, isLoading: false }));
      } catch (e) {
        console.error('Error loading messages:', e);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeConversation?.id]);

  const searchMessages = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, isLoading: true }));
    
    try {
      const results = await chatService.searchMessages(query);
      setState(prev => ({ ...prev, messages: results, isLoading: false }));
    } catch (error) {
      console.error('Error searching messages:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!state.activeConversation) return;
    
    try {
      const olderMessages = await chatService.loadMessages(
        state.activeConversation.id,
        state.messages.length
      );
      setState(prev => ({
        ...prev,
        messages: [...olderMessages, ...prev.messages],
      }));
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  }, [state.activeConversation, state.messages]);

  const refreshConversations = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const fetched = await chatService.getConversations();
      setState(prev => {
        const byId = new Map<string, Conversation>();
        // Start with fetched list
        for (const conv of fetched) byId.set(conv.id, conv);
        // Merge in any existing conversations not present in fetched (e.g., newly created with no messages yet)
        for (const conv of prev.conversations) {
          if (!byId.has(conv.id)) {
            byId.set(conv.id, conv);
          }
        }
        return { ...prev, conversations: Array.from(byId.values()), isLoading: false };
      });
    } catch (error) {
      console.error('Error refreshing conversations:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const addOrUpdateConversation = useCallback((conversation: Conversation) => {
    setState(prev => {
      const existingIndex = prev.conversations.findIndex(c => c.id === conversation.id);
      if (existingIndex >= 0) {
        const updated = [...prev.conversations];
        updated[existingIndex] = { ...updated[existingIndex], ...conversation };
        return { ...prev, conversations: updated };
      }
      return { ...prev, conversations: [conversation, ...prev.conversations] };
    });
  }, []);

  return {
    ...state,
    currentUserId,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    setActiveConversation,
    searchMessages,
    loadMoreMessages,
    refreshConversations,
    addOrUpdateConversation,
  };
}
