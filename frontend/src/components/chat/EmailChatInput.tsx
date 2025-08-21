'use client';

import React, { useState } from 'react';
import { Send, Search, Loader2 } from 'lucide-react';
import { emailChatService } from '@/services/emailChatService';

interface EmailChatInputProps {
  onSendMessage: (email: string, content: string) => void;
  isLoading?: boolean;
}

export default function EmailChatInput({ onSendMessage, isLoading = false }: EmailChatInputProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = async (email: string) => {
    setRecipientEmail(email);
    setEmailError('');

    if (email && emailChatService.validateEmail(email)) {
      const user = await emailChatService.getUserByEmail(email);
      console.log('Found user:', user);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail || !message) {
      return;
    }

    if (!emailChatService.validateEmail(recipientEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    onSendMessage(recipientEmail, message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Email
        </label>
        <div className="relative">
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Enter recipient email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gray-400" />
          )}
        </div>
        {emailError && (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={!recipientEmail || !message || isLoading || !!emailError}
        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2" />
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </>
        )}
      </button>
    </form>
