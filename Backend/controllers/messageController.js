const Message = require('../models/message');
const User = require('../models/user');

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, content, type = 'text', fileUrl = null, replyTo = null } = req.body;
    
    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver user not found' });
    }

    // Check if replyTo message exists
    if (replyTo) {
      const replyMessage = await Message.findById(replyTo);
      if (!replyMessage) {
        return res.status(404).json({ message: 'Message to reply to not found' });
      }
    }

    const message = new Message({ 
      sender: req.user._id, 
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
    await message.populate('replyTo');
    
    res.status(201).json({ 
      message: 'Message sent successfully', 
      data: message 
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId, page = 1, limit = 50 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'username avatar isOnline')
    .populate('receiver', 'username avatar isOnline')
    .populate('replyTo')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limitNum);

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    });

    res.status(200).json({ 
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalMessages / limitNum),
        totalMessages,
        hasMore: skip + limitNum < totalMessages
      }
    });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all users who have messaged or been messaged by the current user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId }
          ]
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$receiver',
              else: '$sender'
            }
          }
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $unwind: '$otherUser'
      },
      {
        $project: {
          _id: 0,
          user: {
            id: '$otherUser._id',
            username: '$otherUser.username',
            avatar: '$otherUser.avatar',
            isOnline: '$otherUser.isOnline',
            lastSeen: '$otherUser.lastSeen'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);

    res.status(200).json({ conversations });
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.body;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the current user is the receiver
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.status(200).json({ message: 'Message marked as read' });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Server error while marking message as read' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the current user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
};
