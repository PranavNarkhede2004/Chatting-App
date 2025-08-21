'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

interface Conversation {
  user: User;
  lastMessage: {
    content: string;
    timestamp: string;
    type: string;
  };
  unreadCount: number;
}

interface ChatSidebarProps {
  onUserSelect: (user: User | null) => void;
  selectedUser: User | null;
}

export default function ChatSidebar({ onUserSelect, selectedUser }: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/message/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data as { conversations: Conversation[] };
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No conversations yet
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.user.id}
              onClick={() => onUserSelect(conversation.user)}
              className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedUser?.id === conversation.user.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {conversation.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {conversation.user.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">
                      {conversation.user.username}
                    </h3>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
