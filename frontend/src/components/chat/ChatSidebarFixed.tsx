'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@/types/chat.types';
import { Search, MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { chatService } from '@/services/chatService';
import { useSocket } from '@/hooks/useSocket';

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation | null) => void;
  isLoading: boolean;
  onConversationsUpdate: () => void;
}

export function ChatSidebar({ 
  conversations, 
  selectedConversation, 
  onConversationSelect, 
  isLoading,
  onConversationsUpdate
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState<string | null>(null);
  const socket = useSocket();

  const filteredConversations = conversations.filter(conv => 
    conv.participants.some(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getDisplayName = (conversation: Conversation) => {
    if (conversation.isGroup && conversation.groupName) {
      return conversation.groupName;
    }
    return conversation.participants.map(p => p.username).join(', ');
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    const maxLength = 30;
    const content = conversation.lastMessage.content;
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  const handleAddUser = async () => {
    if (!email.trim()) {
      setAddUserError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAddUserError('Please enter a valid email address');
      return;
    }

    setIsAddingUser(true);
    setAddUserError(null);
    setAddUserSuccess(null);

    try {
      const conversation = await chatService.createConversationWithUser(email);
      setEmail('');
      setAddUserSuccess('User added successfully!');
      
      // Instead of page reload, trigger conversation refresh
      onConversationsUpdate();
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setAddUserSuccess(null);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error adding user:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        setAddUserError('User not found. Please check the email address.');
      } else if (error.response?.status === 400) {
        setAddUserError('Invalid email format. Please enter a valid email.');
      } else if (error.message?.includes('Network')) {
        setAddUserError('Network error. Please check your connection and try again.');
      } else {
        setAddUserError('Unable to create conversation. Please try again later.');
      }
    } finally {
      setIsAddingUser(false);
    }
  };

  // Listen for real-time conversation updates
  useEffect(() => {
    // For now, we'll rely on manual refresh
    // Socket integration can be added later
  }, [onConversationsUpdate]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="email"
          placeholder="Enter email to add user"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
        />
        <button 
          onClick={handleAddUser} 
          disabled={isAddingUser}
          className={`mt-2 rounded-md px-4 py-2 w-full transition-colors ${isAddingUser ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          {isAddingUser ? <Loader2 className="animate-spin h-5 w-5" /> : 'Add User'}
        </button>
        {addUserError && <p className="text-red-500 text-sm mt-2">{addUserError}</p>}
        {addUserSuccess && <p className="text-green-500 text-sm mt-2">{addUserSuccess}</p>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No conversations yet</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect(conversation)}
              className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getDisplayName(conversation).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {conversation.participants.some(p => p.isOnline) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900 truncate">
                      {getDisplayName(conversation)}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {getLastMessagePreview(conversation)}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center bg-blue-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
