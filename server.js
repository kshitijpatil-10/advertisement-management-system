const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer

const app = express();

const JWT_SECRET = 'your_jwt_secret'; // Use a strong secret key for JWT

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" directory

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ads-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Ad Schema
const adSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    link: { type: String, required: true }
});

const Ad = mongoose.model('Ad', adSchema);

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')); // Use absolute path for directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

// Initialize upload middleware
const upload = multer({ storage });

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the header
    if (!token) {
        return res.sendStatus(403); // Forbidden if no token
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden if token is invalid
        }
        req.user = user; // Save user info to request
        next();
    });
};

// Register a new user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Password validation
    if (password.length < 8) {
        return res.status(400).send('Password must be at least 8 characters long.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });

        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send('Username already exists');
        }
        res.status(500).send('Error registering user: ' + error.message);
    }
});

// Login Route with JWT Token Generation
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid username or password');
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).send('Error logging in: ' + error.message);
    }
});

// Serve home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Serve manage ads page
app.get('/manage-ads', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manage-ads.html'));
});

// Create a new Ad (protected route)
app.post('/ads', upload.single('imageFile'), async (req, res) => {
    const newAd = {
        title: req.body.title,
        description: req.body.description,
        link: req.body.link,
        imageUrl: req.file.path // Save the file path in the database
    };

    try {
        const ad = new Ad(newAd);
        await ad.save();
        res.status(201).send(ad);
    } catch (error) {
        res.status(400).send('Error creating ad: ' + error.message);
    }
});

// Fetch Ads (public route)
app.get('/ads', async (req, res) => {
    try {
        const ads = await Ad.find();
        res.json(ads);
    } catch (error) {
        res.status(500).send('Error fetching ads: ' + error.message);
    }
});
// Edit an Ad (protected route)
app.put('/ads/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, link } = req.body;

    try {
        const updatedAd = await Ad.findByIdAndUpdate(id, { title, description, link }, { new: true });
        
        if (!updatedAd) {
            return res.status(404).send('Ad not found');
        }

        res.send(updatedAd);
    } catch (error) {
        res.status(500).send('Error updating ad: ' + error.message);
    }
});
// Delete an Ad (protected route)
app.delete('/ads/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAd = await Ad.findByIdAndDelete(id);

        if (!deletedAd) {
            return res.status(404).send('Ad not found');
        }

        res.send('Ad deleted successfully');
    } catch (error) {
        res.status(500).send('Error deleting ad: ' + error.message);
    }
});



// Start Server
app.listen(3003, () => {
    console.log('Server running on http://localhost:3003');
});
