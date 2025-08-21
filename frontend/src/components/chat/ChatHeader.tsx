'use client';

import { Conversation } from '@/types/chat.types';
import { MoreVertical, Phone, Video, Search } from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
  typingUsers: string[];
}

export function ChatHeader({ conversation, typingUsers }: ChatHeaderProps) {
  const getDisplayName = (conversation: Conversation) => {
    if (conversation.isGroup && conversation.groupName) {
      return conversation.groupName;
    }
    return conversation.participants.map(p => p.username).join(', ');
  };

  const getStatusText = () => {
    if (typingUsers.length > 0) {
      return typingUsers.length === 1 
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.length} people are typing...`;
    }
    
    const onlineCount = conversation.participants.filter(p => p.isOnline).length;
    return onlineCount > 0 ? `${onlineCount} online` : 'Offline';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {getDisplayName(conversation).charAt(0).toUpperCase()}
              </span>
            </div>
            {conversation.participants.some(p => p.isOnline) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{getDisplayName(conversation)}</h3>
            <p className="text-sm text-gray-500">{getStatusText()}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
