const User = require('../models/user');
const bcrypt = require('bcryptjs');

const userCreationController = {
    // Create a new user by email (for invitation system)
    createUserByEmail: async (req, res) => {
        try {
            const { email, username } = req.body;
            
            // Validate input
            if (!email || !username) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and username are required'
                });
            }

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

            // Validate username
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
                return res.status(400).json({
                    success: false,
                    message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists',
                    data: existingUser
                });
            }

            // Check if username already exists
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already taken'
                });
            }

            // Generate a temporary password
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            // Create new user
            const newUser = new User({
                username,
                email: normalizedEmail,
                password: hashedPassword,
                isOnline: false,
                lastSeen: new Date()
            });

            await newUser.save();

            // Return user without password
            const userResponse = {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                isOnline: newUser.isOnline,
                lastSeen: newUser.lastSeen
            };

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: userResponse,
                tempPassword: tempPassword // Send temp password for first login
            });

        } catch (error) {
            console.error('Create user by email error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while creating user',
                error: error.message
            });
        }
    },

    // Check if user exists by email
    checkUserExists: async (req, res) => {
        try {
            const { email } = req.query;
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email parameter is required'
                });
            }

            const normalizedEmail = email.toLowerCase().trim();
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            const user = await User.findOne({ email: normalizedEmail })
                .select('username email avatar isOnline lastSeen');

            res.json({
                success: true,
                exists: !!user,
                data: user || null
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error checking user existence',
                error: error.message
            });
        }
    }
};

module.exports = userCreationController;
