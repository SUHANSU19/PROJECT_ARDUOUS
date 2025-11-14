const jwt=require('jsonwebtoken');
require('dotenv').config();
// This is our "Bouncer" function.
// It's "middleware", so it has a third special parameter: 'next'
const authMiddleware = (req, res, next) => {
    
    // 1. Get the "membership card" (token) from the user
    // The user is *supposed* to send it in the 'Authorization' header
    // It looks like this: "Bearer eyJhbGciOiJIUz..."
    const authHeader = req.headers['authorization'];
    
    // 2. Check if they even have a card
    if (!authHeader) {
        // If they don't, "Kick them out" (Unauthorized)
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // 3. The card is there, but it's in the format "Bearer <token>"
    // We just want the second part (the token itself)
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token is missing or malformed.' });
    }

    try {
        // 4. CHECK THE CARD'S SIGNATURE
        // We use our "secret ink" to "verify" the card.
        // If the card is fake or expired, this line will *CRASH* (throw an error)
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // 5. 🏆 The card is REAL!
        // The 'payload' is the data we put in the card (like { userId: 1 })
        // We now "stamp the user's hand" by attaching this payload
        // to the 'req' object.
        req.user = payload; 

        // 6. "You're good to go."
        // We call 'next()' to "open the gate" and let the user
        // proceed to the *actual* route they were trying to get to.
        next();

    } catch (err) {
        // 7. The "try" block crashed! The card is FAKE or EXPIRED.
        // "Kick them out."
        res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
};

module.exports = authMiddleware; // Export the Bouncer
