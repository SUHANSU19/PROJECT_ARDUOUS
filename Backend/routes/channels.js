// backend/routes/channels.js

const express = require('express');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

// 💡 This is a new trick!
//  tell this router to "merge" the parameters from the
// lobby (index.js). This is how we will get the "serverId".
const router = express.Router({ mergeParams: true });

// --- CREATE A NEW CHANNEL ---
// The path is just '/' because the full path is defined in index.js
router.post('/', authMiddleware, async (req, res) => {

    // 1. Get all our "ingredients"
    const { name } = req.body; // From the "order form" (JSON body)
    const { serverId } = req.params; // From the URL (e.g., /servers/1/...)
    const { userId } = req.user; // From our Bouncer's "hand stamp"

    if (!name) {
        return res.status(400).json({ error: 'Channel name is required.' });
    }

    try {
        // 2. 💡 AUTHORIZATION Check (Our first one!)
        // Before we create the channel, are we *allowed* to?
        // Let's check if the user is the *owner* of the server.
        const serverResult = await pool.query(
            'SELECT owner_id FROM Servers WHERE id = $1',
            [serverId]
        );

        if (serverResult.rows.length === 0) {
            return res.status(404).json({ error: 'Server not found.' });
        }

        if (serverResult.rows[0].owner_id !== userId) {
            // Not the owner! "Kick them out" (Forbidden)
            return res.status(403).json({ error: 'You do not have permission to create channels in this server.' });
        }

        // 3. We are authorized! Now, create the channel.
        const newChannel = await pool.query(
            'INSERT INTO Channels (name, server_id) VALUES ($1, $2) RETURNING *',
            [name, serverId]
        );

        // 4. Send back the new channel
        res.status(201).json(newChannel.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;