'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { emailChatService } from '@/services/emailChatService';
import EmailChatInput from './EmailChatInput';
import { Loader2, AlertCircle, User, PlusCircle } from 'lucide-react';

export default function EmailChatContainer() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedEmail, setSelectedEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [recipientUser, setRecipientUser] = useState<any>(null);
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [createUserEmail, setCreateUserEmail] = useState('');
    const [createUsername, setCreateUsername] = useState('');
    const [creatingUser, setCreatingUser] = useState(false);

    const handleSendMessage = async (email: string, content: string) => {
        if (!user) return;

        setSending(true);
        setError('');
        try {
            // First check if user exists
            const userCheck = await emailChatService.checkUserExists(email);
            
            if (!userCheck.exists) {
                setCreateUserEmail(email);
                setShowCreateUser(true);
                setError(`User with email ${email} not found. Would you like to create a new user?`);
                return;
            }

            const message = await emailChatService.sendMessageByEmail(email, content);

            // Add the new message to the conversation
            setMessages(prev => [...prev, message]);
            setSelectedEmail(email);
            
            // Get recipient info
            const userInfo = await emailChatService.getUserByEmail(email);
            setRecipientUser(userInfo);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setSending(false);
        }
    };

    const loadConversation = async (email: string) => {
        if (!email) return;

        setLoading(true);
        setError('');
        try {
            const conversation = await emailChatService.getConversationByEmail(email);
            setMessages(conversation.messages);
            setRecipientUser(conversation.otherUser);
            setSelectedEmail(email);
        } catch (error: any) {
            if (error.message.includes('User with this email not found')) {
                setCreateUserEmail(email);
                setShowCreateUser(true);
                setError(`User with email ${email} not found. Would you like to create a new user?`);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!createUsername.trim() || !emailChatService.validateUsername(createUsername)) {
            setError('Please enter a valid username (3-30 characters, letters, numbers, and underscores only)');
            return;
        }

        setCreatingUser(true);
        setError('');
        try {
            const newUser = await emailChatService.createUserByEmail(createUserEmail, createUsername);
            setRecipientUser(newUser);
            setShowCreateUser(false);
            setCreateUsername('');
            setError('');
            
            // Now try to send the message or load conversation
            if (selectedEmail === createUserEmail) {
                await loadConversation(createUserEmail);
            }
        } catch (error: any) {
            setError(error.message);
        } finally {
            setCreatingUser(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white p-4">
                    <h2 className="text-xl font-semibold">Send Message by Email</h2>
                    <p className="text-sm opacity-90">Send messages to any registered user using their email address</p>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <h3 className="text-lg font-medium mb-4">Send New Message</h3>
                            <EmailChatInput 
                                onSendMessage={handleSendMessage}
                                isLoading={sending}
                            />
                        </div>

                        <div className="lg:col-span-2">
                            {selectedEmail && recipientUser && (
                                <div className="border rounded-lg">
                                    <div className="bg-gray-50 p-4 border-b">
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 mr-2 text-gray-600" />
                                            <div>
                                                <p className="font-medium">{recipientUser.username}</p>
                                                <p className="text-sm text-gray-600">{recipientUser.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-96 overflow-y-auto p-4">
                                        {loading ? (
                                            <div className="flex justify-center items-center h-full">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="text-center text-gray-500 py-8">
                                                <p>No messages yet. Start a conversation!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {messages.map((message, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex ${message.sender.email === user?.email ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender.email === user?.email
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-200 text-gray-800'
                                                            }`}
                                                        >
                                                            <p className="text-sm">{message.content}</p>
                                                            <p className={`text-xs mt-1 ${message.sender.email === user?.email ? 'text-blue-100' : 'text-gray-500'}`}>
                                                                {new Date(message.timestamp).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Creation Modal */}
                    {showCreateUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                                <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    User with email <strong>{createUserEmail}</strong> not found. 
                                    Create a new user to start messaging.
                                </p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={createUsername}
                                            onChange={(e) => setCreateUsername(e.target.value)}
                                            placeholder="Enter username"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            maxLength={30}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            3-30 characters, letters, numbers, and underscores only
                                        </p>
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleCreateUser}
                                            disabled={creatingUser || !createUsername.trim()}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {creatingUser ? (
                                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                            ) : (
                                                'Create User'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowCreateUser(false);
                                                setCreateUsername('');
                                                setError('');
                                            }}
                                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
