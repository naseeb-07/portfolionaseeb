const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Blog = require('./models/Blog');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Serve static files

// Load env vars (simulated)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeinproduction';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- API Routes ---

// Login Route
app.post('/api/login', (req, res) => {
    const { password } = req.body;

    // Simple password check
    if (password === ADMIN_PASSWORD) {
        // Create token
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid password' });
    }
});

// Get all blogs (Public)
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new blog (Protected)
app.post('/api/blogs', authenticateToken, async (req, res) => {
    const { title, excerpt, image, date, link } = req.body;

    const blog = new Blog({
        title,
        excerpt,
        image,
        date,
        link
    });

    try {
        const newBlog = await blog.save();
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- Frontend Support Routes ---

// Serve admin page (checking token on client side, but we can also block direct access if we want strictness)
// For now, let's rely on client-side JS redirect for simplicity, as per plan.

// Fallback route to serve index.html for SPA-like navigation or 404s
app.get(/(.*)/, (req, res) => {
    // Check if the request is for the API, user might have typed wrong API endpoint
    if (req.path.startsWith('/api')) {
        res.status(404).json({ message: 'API route not found' });
    } else {
        // Serve index.html for any other route (like /project-1, etc if we had client routing)
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
module.exports = app;

