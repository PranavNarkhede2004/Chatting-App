const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const auth = require('./middleware/auth');
const User = require('./models/user');
const Message = require('./models/message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp');

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('MongoDB connection error:', err);
});

// Basic route
app.get('/', (req, res) => {
  res.send('Chat backend is running');
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join user room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle send message
  socket.on('send_message', async (data) => {
    try {
      const { sender, receiver, content, type = 'text', fileUrl = null, replyTo = null } = data;
      
      const message = new Message({ 
        sender, 
        receiver, 
        content, 
        type, 
        fileUrl, 
        replyTo 
      });
      
      await message.save();
      
      // Populate sender and receiver details
      await message.populate('sender', 'username avatar isOnline');
      await message.populate('receiver', 'username avatar isOnline');
      
      // Emit to receiver if online
      socket.to(receiver).emit('receive_message', message);
      // Emit to sender for confirmation
      socket.emit('message_sent', message);
      
    } catch (err) {
      console.error('Socket send message error:', err);
      socket.emit('error', { message: 'Message not sent' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.receiver).emit('user_typing', {
      sender: data.sender,
      isTyping: true
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.receiver).emit('user_typing', {
      sender: data.sender,
      isTyping: false
    });
  });

  // Handle online status
  socket.on('update_status', async (data) => {
    try {
      const { userId, isOnline } = data;
      await User.findByIdAndUpdate(userId, { isOnline, lastSeen: new Date() });
      socket.broadcast.emit('user_status_changed', { userId, isOnline });
    } catch (err) {
      console.error('Update status error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Handle port conflicts and provide better error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    server.listen(PORT + 1, () => {
      console.log(`Server is running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', error);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
