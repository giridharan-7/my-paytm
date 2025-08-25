// backend/routes/user.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const zod = require('zod');
const { User, Account, Transaction } = require('../db');
const { JWT_SECRET } = require('../config');
const { authMiddleware } = require('../middleware');

const router = express.Router();

// Validation schemas
const signupBody = zod.object({
    username: zod.string().email('Invalid email format'),
    firstName: zod.string().min(1, 'First name is required').max(50),
    lastName: zod.string().min(1, 'Last name is required').max(50),
    password: zod.string().min(6, 'Password must be at least 6 characters')
});

const signinBody = zod.object({
    username: zod.string().email('Invalid email format'),
    password: zod.string().min(1, 'Password is required')
});

const updateBody = zod.object({
    firstName: zod.string().min(1).max(50).optional(),
    lastName: zod.string().min(1).max(50).optional(),
    password: zod.string().min(6).optional()
});

// Sign up route
router.post('/signup', async (req, res) => {
    try {
        const validation = signupBody.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.issues.map(issue => ({
                    field: issue.path[0],
                    message: issue.message
                }))
            });
        }

        const { username, firstName, lastName, password } = validation.data;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            username,
            password: hashedPassword,
            firstName,
            lastName
        });

        // Create account with initial balance
        await Account.create({
            userId: user._id,
            balance: 1000 + Math.random() * 9000 // Random balance between 1000-10000
        });

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Sign in route
router.post('/signin', async (req, res) => {
    try {
        const validation = signinBody.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.issues.map(issue => ({
                    field: issue.path[0],
                    message: issue.message
                }))
            });
        }

        const { username, password } = validation.data;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const validation = updateBody.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.issues.map(issue => ({
                    field: issue.path[0],
                    message: issue.message
                }))
            });
        }

        const updateData = { ...validation.data };
        
        // Hash password if provided
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 12);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, select: '-password' }
        );

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const account = await Account.findOne({ userId: req.userId });
        
        res.json({
            user,
            balance: account ? account.balance : 0
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Search users for transfers
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const filter = req.query.filter || '';
        
        if (filter.length < 2) {
            return res.json({ users: [] });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: req.userId } }, // Exclude current user
                {
                    $or: [
                        { firstName: { $regex: filter, $options: 'i' } },
                        { lastName: { $regex: filter, $options: 'i' } },
                        { username: { $regex: filter, $options: 'i' } }
                    ]
                }
            ]
        }).select('username firstName lastName').limit(10);

        res.json({
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`
            }))
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Get transaction history
router.get('/transactions', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({
            $or: [
                { fromUserId: req.userId },
                { toUserId: req.userId }
            ]
        })
        .populate('fromUserId', 'firstName lastName username')
        .populate('toUserId', 'firstName lastName username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await Transaction.countDocuments({
            $or: [
                { fromUserId: req.userId },
                { toUserId: req.userId }
            ]
        });

        const formattedTransactions = transactions.map(tx => ({
            id: tx._id,
            amount: tx.amount,
            type: tx.fromUserId._id.toString() === req.userId ? 'sent' : 'received',
            otherUser: tx.fromUserId._id.toString() === req.userId ? 
                `${tx.toUserId.firstName} ${tx.toUserId.lastName}` : 
                `${tx.fromUserId.firstName} ${tx.fromUserId.lastName}`,
            description: tx.description,
            status: tx.status,
            date: tx.createdAt
        }));

        res.json({
            transactions: formattedTransactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

module.exports = router;