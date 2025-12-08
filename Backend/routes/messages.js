const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

// We use mergeParams because the 'channelId' is in the parent route in index.js
const router = express.Router({ mergeParams: true });

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