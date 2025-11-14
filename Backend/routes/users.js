// 1. Importing the Tools
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
    
    // 1. Get user data from the "order form" (the request body)
    const { username, email, password } = req.body;

    // 2. Validate the data (check if anything is missing)
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    try {
        // 3. SCRAMBLE THE PASSWORD (Security)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. SAVE THE USER TO THE DATABASE
        const result = await pool.query(
            // $1, $2, $3 are placeholders to prevent SQL Injection
            'INSERT INTO Users (username, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        const newUser = result.rows[0];

        // 5. Success! Send back a "201 Created" status.
        res.status(201).json({
            message: 'User registered successfully!',
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });

    } catch (err) {
        console.error("Registration Error:", err.message);

        // Handle the error if the username or email is already taken
        if (err.code === '23505') { // PostgreSQL code for unique violation
            return res.status(400).json({ error: 'Email or Username already taken.' });
        }

        // Catch all other server errors
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// ... (Your /register route code is above this) ...

// --- THE LOGIN COUNTER: POST /api/users/login ---
router.post('/login', async (req, res) => {
    
    // 1. Get user data
    const { email, password } = req.body;

    // 2. Validate the data
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    try {
        // 3. Find the user in the database
        const result = await pool.query(
            'SELECT * FROM Users WHERE email = $1',
            [email]
        );

        // 4. Check if the user even exists
        if (result.rows.length === 0) {
            // User not found.
            // We send a generic "invalid credentials" error for security.
            // We don't want to tell hackers "that email exists!"
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0]; // The user's row from the database

        // 5. THE "PASSWORD CHECK" (Security)
        // We use bcrypt to compare the (plain) password from the user
        // with the (scrambled) hashedPassword from our database.
        const isValidPassword = await bcrypt.compare(password, user.hashed_password);

        if (!isValidPassword) {
            // Password was wrong.
            // Again, send a generic error for security.
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // 6. 🏆 Success! User is real! NOW, MAKE THE "MEMBERSHIP CARD" (JWT)
        
        // This is the data we want to put *inside* the card
        const payload = {
            userId: user.id
        };
        
        // This is the "Magic Ink" from our .env file
        const secret = process.env.JWT_SECRET;
        
        // This is the "card maker"
        // It "signs" the payload with our secret ink.
        const token = jwt.sign(payload, secret, {
            expiresIn: '1h' // The card expires in 1 hour
        });

        // 7. Send the card (token) back to the user
        res.json({
            message: 'Logged in successfully!',
            token: token,
            userId: user.id
        });

    } catch (err) {
        // 8. The "Emergency Plan"
        console.error("Login Error:", err.message);
        res.status(500).json({ error: 'Server error during login.' });
    }
});





// We must export the router for index.js to use it
module.exports = router;