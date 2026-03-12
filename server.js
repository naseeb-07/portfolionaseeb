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


// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio';
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- API Routes ---



// Get all blogs (Public)
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// --- Frontend Support Routes ---

// Serve admin page (checking token on client side, but we can also block direct access if we want strictness)
// For now, let's rely on client-side JS redirect for simplicity, as per plan.

// Explicitly serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler for anything else
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ message: 'API route not found' });
    } else {
        res.status(404).send('Page not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
module.exports = app;

