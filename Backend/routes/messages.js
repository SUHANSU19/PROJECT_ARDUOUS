const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

// We use mergeParams because the 'channelId' is in the parent route in index.js
const router = express.Router({ mergeParams: true });

// Backend/routes/messages.js

// --- SEND A MESSAGE ---
// Route: POST /api/channels/:channelId/messages
router.post('/', authMiddleware, async (req, res) => {
    const { content } = req.body;
    const { channelId } = req.params;
    const userId = req.user.userId;

    if (!content) {
        return res.status(400).json({ error: 'Message content is required.' });
    }

    try {
        // 1. Security Check: Is the user actually in the server?
        // We need to find which server this channel belongs to first.
        const channelResult = await pool.query(
            'SELECT server_id FROM Channels WHERE id = $1', 
            [channelId]
        );

        if (channelResult.rows.length === 0) {
            return res.status(404).json({ error: 'Channel not found.' });
        }

        const serverId = channelResult.rows[0].server_id;

        // 2. Check membership
        const memberCheck = await pool.query(
            'SELECT * FROM ServerMembers WHERE server_id = $1 AND user_id = $2',
            [serverId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ error: 'You must join the server to send messages.' });
        }

        // 3. Send the message!
        const result = await pool.query(
            'INSERT INTO Messages (content, channel_id, author_id) VALUES ($1, $2, $3) RETURNING *',
            [content, channelId, userId]
        );

        const newMessage = result.rows[0];
        
        // 4. (Future) We will trigger Socket.io here later!
        // io.to(channelId).emit('new_message', newMessage);

        res.status(201).json(newMessage);

    } catch (err) {
        console.error("Send Message Error:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- GET MESSAGES FOR A CHANNEL ---
// Route: GET /api/channels/:channelId/messages
router.get('/', authMiddleware, async (req, res) => {
    const { channelId } = req.params;

    try {
        // 1. Check if the channel exists first
        const channelCheck = await pool.query('SELECT * FROM Channels WHERE id = $1', [channelId]);
        if (channelCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        // 2. Get the messages
        // We JOIN with the Users table so we can see WHO sent the message!
        const messages = await pool.query(
            `SELECT Messages.id, Messages.content, Messages.created_at, 
                    Users.id as user_id, Users.username
             FROM Messages
             JOIN Users ON Messages.author_id = Users.id
             WHERE channel_id = $1
             ORDER BY Messages.created_at ASC
             LIMIT 50`,
            [channelId]
        );

        // 3. Send the list back
        res.json(messages.rows);

    } catch (err) {
        console.error("Get Messages Error:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
