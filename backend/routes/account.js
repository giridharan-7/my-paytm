// backend/routes/account.js
const express = require('express');
const mongoose = require('mongoose');
const zod = require('zod');
const { authMiddleware } = require('../middleware');
const { Account, User, Transaction } = require('../db');

const router = express.Router();

// Validation schemas
const transferBody = zod.object({
    to: zod.string().min(1, 'Recipient is required'),
    amount: zod.number().positive('Amount must be positive').max(100000, 'Amount too large'),
    description: zod.string().max(200).optional()
});

// Get account balance
router.get('/balance', authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });
        
        if (!account) {
            return res.status(404).json({
                message: 'Account not found'
            });
        }

        res.json({
            balance: parseFloat(account.balance.toFixed(2)),
            userId: req.userId
        });

    } catch (error) {
        console.error('Balance fetch error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

// Transfer money
router.post('/transfer', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const validation = transferBody.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.error.issues.map(issue => ({
                    field: issue.path[0],
                    message: issue.message
                }))
            });
        }

        const { to, amount, description = '' } = validation.data;

        // Check if trying to transfer to self
        if (to === req.userId) {
            return res.status(400).json({
                message: 'Cannot transfer money to yourself'
            });
        }

        session.startTransaction();

        // Fetch sender's account
        const senderAccount = await Account.findOne({ userId: req.userId }).session(session);
        if (!senderAccount) {
            await session.abortTransaction();
            return res.status(404).json({
                message: 'Sender account not found'
            });
        }

        // Check sufficient balance
        if (senderAccount.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: 'Insufficient balance'
            });
        }

        // Fetch recipient's account
        const recipientAccount = await Account.findOne({ userId: to }).session(session);
        if (!recipientAccount) {
            await session.abortTransaction();
            return res.status(404).json({
                message: 'Recipient account not found'
            });
        }

        // Verify recipient user exists
        const recipientUser = await User.findById(to).session(session);
        if (!recipientUser) {
            await session.abortTransaction();
            return res.status(404).json({
                message: 'Recipient user not found'
            });
        }

        // Perform the transfer
        await Account.updateOne(
            { userId: req.userId }, 
            { $inc: { balance: -amount } }
        ).session(session);

        await Account.updateOne(
            { userId: to }, 
            { $inc: { balance: amount } }
        ).session(session);

        // Log the transaction
        const transaction = await Transaction.create([{
            fromUserId: req.userId,
            toUserId: to,
            amount,
            description,
            status: 'completed'
        }], { session });

        // Commit the transaction
        await session.commitTransaction();

        res.json({
            message: 'Transfer successful',
            transactionId: transaction[0]._id,
            amount,
            recipient: {
                name: `${recipientUser.firstName} ${recipientUser.lastName}`,
                username: recipientUser.username
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Transfer error:', error);
        res.status(500).json({
            message: 'Transfer failed. Please try again.'
        });
    } finally {
        session.endSession();
    }
});

// Get account statement/mini statement
router.get('/statement', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const recentTransactions = await Transaction.find({
            $or: [
                { fromUserId: req.userId },
                { toUserId: req.userId }
            ]
        })
        .populate('fromUserId', 'firstName lastName')
        .populate('toUserId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit);

        const account = await Account.findOne({ userId: req.userId });

        const formattedTransactions = recentTransactions.map(tx => ({
            id: tx._id,
            amount: tx.amount,
            type: tx.fromUserId._id.toString() === req.userId ? 'debit' : 'credit',
            description: tx.description || 'Money transfer',
            otherParty: tx.fromUserId._id.toString() === req.userId ? 
                `${tx.toUserId.firstName} ${tx.toUserId.lastName}` : 
                `${tx.fromUserId.firstName} ${tx.fromUserId.lastName}`,
            date: tx.createdAt,
            status: tx.status
        }));

        res.json({
            currentBalance: account ? parseFloat(account.balance.toFixed(2)) : 0,
            recentTransactions: formattedTransactions
        });

    } catch (error) {
        console.error('Statement fetch error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

module.exports = router;