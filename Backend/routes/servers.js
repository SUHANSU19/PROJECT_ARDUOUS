// backend/routes/servers.js

const express = require('express');
const { pool } = require('../db'); // "Borrow" the database refrigerator
const authMiddleware = require('../middleware/auth'); // "Hire" our Bouncer!

const router = express.Router(); // Create our "mini-manager" for this room

// --- THE "CREATE A SERVER" COUNTER: POST /api/servers ---
//
// 💡 This is the magic!
// We put our "Bouncer" (authMiddleware) in the middle.
// This route now says: "To create a server, you MUST pass the Bouncer's check first."
//
router.post('/', authMiddleware, async (req, res) => {
    
    // 1. Get the server name from the user
    const { name } = req.body;
    
    // 2. Get the user's ID (from the Bouncer's "hand stamp"!)
    // We know req.user exists because the Bouncer (authMiddleware)
    // added it for us. This is *who* is creating the server.
    const ownerId = req.user.userId;

    if (!name) {
        return res.status(400).json({ error: 'Server name is required.' });
    }

    try {
        // 3. Save the new server to the database
        const result = await pool.query(
            'INSERT INTO Servers (name, owner_id) VALUES ($1, $2) RETURNING *',
            [name, ownerId]
        );

        const newServer = result.rows[0];

        // 4. Success! Send back the new server's info
        res.status(201).json(newServer);

    } catch (err) {
        console.error("Create Server Error:", err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;