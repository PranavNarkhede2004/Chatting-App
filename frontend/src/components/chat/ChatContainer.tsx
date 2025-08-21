'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessages } from './ChatMessages';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { Conversation } from '@/types/chat.types';
import { chatService } from '@/services/chatService';

export function ChatContainer() {
  const chat = useChat();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const handleConversationSelect = (conversation: Conversation | null) => {
    setSelectedConversation(conversation);
    chat.setActiveConversation(conversation);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || selectedConversation.participants.length === 0) return;
    const otherUserId = selectedConversation.participants[0].id;
    try {
      await chatService.sendMessage(otherUserId, content);
      // Optionally refresh messages list here if needed
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <ChatSidebar 
        conversations={chat.conversations}
        selectedConversation={selectedConversation}
        onConversationSelect={handleConversationSelect}
        isLoading={chat.isLoading}
        // Provide a way for the sidebar to refresh after adding a user
        onConversationsUpdate={chat.refreshConversations}
        // When a new conversation is created, push it into state immediately
        // @ts-ignore passing optional prop
        onConversationCreated={chat.addOrUpdateConversation}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <ChatHeader 
              conversation={selectedConversation}
              typingUsers={chat.typingUsers}
            />
            <ChatMessages 
              messages={chat.messages}
              currentUserId={chat.currentUserId || ''}
              onMessageRead={chat.markAsRead}
            />
            <ChatInput 
              onSendMessage={(content) => chat.sendMessage(content)}
              onStartTyping={chat.startTyping}
              onStopTyping={chat.stopTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
