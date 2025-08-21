const Message = require('../models/message');
const User = require('../models/user');

const emailMessageController = {
    // Send message to user by email
    sendMessageByEmail: async (req, res) => {
        try {
            const { recipientEmail, content, type = 'text', fileUrl = null, replyTo = null } = req.body;
            const senderId = req.user._id;

            // Validate input
            if (!recipientEmail || !content) {
                return res.status(400).json({
                    success: false,
                    message: 'Recipient email and content are required'
                });
            }

            // Normalize email
            const normalizedEmail = recipientEmail.toLowerCase().trim();

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Find recipient by email (case-insensitive)
            const recipient = await User.findOne({ 
                email: normalizedEmail 
            });
            
            if (!recipient) {
                return res.status(404).json({
                    success: false,
                    message: 'User with this email not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Check if trying to send message to self
            if (recipient._id.toString() === senderId.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot send message to yourself'
                });
            }

            // Check if replyTo message exists
            if (replyTo) {
                const replyMessage = await Message.findById(replyTo);
                if (!replyMessage) {
                    return res.status(404).json({
                        success: false,
                        message: 'Message to reply to not found'
                    });
                }
            }

            // Create new message
            const message = new Message({
                sender: senderId,
                receiver: recipient._id,
                content,
                type,
                fileUrl,
                replyTo,
                timestamp: new Date()
            });

            await message.save();

            // Populate sender and receiver details
            await message.populate('sender', 'username avatar email isOnline');
            await message.populate('receiver', 'username avatar email isOnline');
            await message.populate('replyTo');

            res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                data: message
            });
        } catch (error) {
            console.error('Send message by email error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while sending message',
                error: error.message
            });
        }
    },

    // Get user info by email
    getUserByEmail: async (req, res) => {
        try {
            const { email } = req.params;
            
            // Normalize email
            const normalizedEmail = email.toLowerCase().trim();
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            const user = await User.findOne({ 
                email: normalizedEmail 
            }).select('username email avatar isOnline lastSeen');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Normalize response to include `id` field expected by frontend
            const normalizedUser = {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen
            };

            res.json({
                success: true,
                data: normalizedUser
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching user',
                error: error.message
            });
        }
    },

    // Search users by email (new endpoint for frontend)
    searchUserByEmail: async (req, res) => {
        try {
            const { email } = req.query;
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email parameter is required'
                });
            }

            const user = await User.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') } 
            }).select('username email avatar isOnline lastSeen');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Normalize response to include `id` field expected by frontend
            const normalizedUser = {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen
            };

            res.json({
                success: true,
                data: normalizedUser
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error searching user',
                error: error.message
            });
        }
    },

    // Get conversation with user by email
    getConversationByEmail: async (req, res) => {
        try {
            const userId = req.user._id;
            const { email } = req.params;
            const { page = 1, limit = 50 } = req.query;

            // Find the other user by email (case-insensitive)
            const otherUser = await User.findOne({ 
                email: { $regex: new RegExp(`^${email}$`, 'i') } 
            });
            if (!otherUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            const messages = await Message.find({
                $or: [
                    { sender: userId, receiver: otherUser._id },
                    { sender: otherUser._id, receiver: userId }
                ]
            })
            .populate('sender', 'username avatar email isOnline')
            .populate('receiver', 'username avatar email isOnline')
            .populate('replyTo')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limitNum);

            // Get total count for pagination
            const totalMessages = await Message.countDocuments({
                $or: [
                    { sender: userId, receiver: otherUser._id },
                    { sender: otherUser._id, receiver: userId }
                ]
            });

            res.json({
                success: true,
                data: {
                    messages: messages.reverse(),
                    otherUser: {
                        id: otherUser._id,
                        username: otherUser.username,
                        email: otherUser.email,
                        avatar: otherUser.avatar,
                        isOnline: otherUser.isOnline
                    },
                    pagination: {
                        currentPage: pageNum,
                        totalPages: Math.ceil(totalMessages / limitNum),
                        totalMessages,
                        hasMore: skip + limitNum < totalMessages
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching conversation',
                error: error.message
            });
        }
    }
};

module.exports = emailMessageController;
