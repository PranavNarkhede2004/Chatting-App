const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Message = require('../models/message');

class SocketHandler {
  constructor(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.connectedUsers = new Map();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.username} connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      
      // Update user online status
      this.updateUserStatus(socket.userId, true);
      
      // Send online users list to newly connected user
      socket.emit('online_users', Array.from(this.connectedUsers.keys()));

      // Handle joining conversation rooms
      socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.user.username} joined conversation ${conversationId}`);
      });

      socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${socket.user.username} left conversation ${conversationId}`);
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { receiver, content, type = 'text', fileUrl = null, replyTo = null } = data;
          
          // Create message in database
          const message = new Message({
            sender: socket.userId,
            receiver,
            content,
            type,
            fileUrl,
            replyTo,
            timestamp: new Date()
          });

          await message.save();
          
          // Populate message details
          await message.populate('sender', 'username avatar isOnline');
          await message.populate('receiver', 'username avatar isOnline');
          await message.populate('replyTo');

          // Emit to conversation room
          const conversationId = [socket.userId, receiver].sort().join('_');
          this.io.to(`conversation_${conversationId}`).emit('new_message', message);
          
          // Emit to receiver's personal room if they're online
          const receiverSocketId = this.connectedUsers.get(receiver);
          if (receiverSocketId) {
            this.io.to(`user_${receiver}`).emit('new_message', message);
          }

          // Send confirmation to sender
          socket.emit('message_sent', { messageId: message._id, status: 'delivered' });

        } catch (error) {
          socket.emit('message_error', { error: error.message });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { receiver, conversationId } = data;
        const receiverSocketId = this.connectedUsers.get(receiver);
        
        if (receiverSocketId) {
          this.io.to(`user_${receiver}`).emit('user_typing', {
            userId: socket.userId,
            username: socket.user.username,
            conversationId
          });
        }
      });

      socket.on('typing_stop', (data) => {
        const { receiver, conversationId } = data;
        const receiverSocketId = this.connectedUsers.get(receiver);
        
        if (receiverSocketId) {
          this.io.to(`user_${receiver}`).emit('user_stop_typing', {
            userId: socket.userId,
            conversationId
          });
        }
      });

      // Handle message read receipts
      socket.on('mark_read', async (data) => {
        try {
          const { messageId } = data;
          const message = await Message.findById(messageId);
          
          if (message && message.receiver.toString() === socket.userId) {
            message.isRead = true;
            message.readAt = new Date();
            await message.save();
            
            // Notify sender
            const senderSocketId = this.connectedUsers.get(message.sender.toString());
            if (senderSocketId) {
              this.io.to(`user_${message.sender}`).emit('message_read', {
                messageId,
                readAt: message.readAt
              });
            }
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      // Handle adding users to conversations
      socket.on('add_user_to_conversation', async (data) => {
        try {
          const { conversationId, userId } = data;
          
          // Add user to conversation room
          const targetSocketId = this.connectedUsers.get(userId);
          if (targetSocketId) {
            this.io.sockets.sockets.get(targetSocketId).join(`conversation_${conversationId}`);
            this.io.to(`conversation_${conversationId}`).emit('user_added', {
              userId,
              addedBy: socket.userId,
              conversationId
            });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to add user to conversation' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.username} disconnected`);
        this.connectedUsers.delete(socket.userId);
        this.updateUserStatus(socket.userId, false);
        
        // Notify other users
        socket.broadcast.emit('user_offline', socket.userId);
      });
    });
  }

  updateUserStatus(userId, isOnline) {
    User.findByIdAndUpdate(userId, { isOnline, lastSeen: new Date() })
      .then(() => {
        // Broadcast status update to all users
        this.io.emit('user_status_changed', { userId, isOnline });
      })
      .catch(error => console.error('Error updating user status:', error));
  }

  // Helper method to send notification to specific user
  sendNotification(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }
}

module.exports = SocketHandler;
