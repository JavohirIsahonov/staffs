const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

// Middleware to parse JSON requests
app.use(express.json());

// User routes
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});