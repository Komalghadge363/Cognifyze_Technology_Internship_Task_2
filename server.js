const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve HTML file from current directory

// Temporary server-side storage
let userStorage = [];

// Server-side validation function
function validateUserData(data) {
    const errors = {};
    
    // Username validation
    if (!data.username || data.username.trim() === '') {
        errors.username = 'Username is required';
    } else if (data.username.length < 3) {
        errors.username = 'Username must be at least 3 characters';
    } else if (data.username.length > 20) {
        errors.username = 'Username cannot exceed 20 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || data.email.trim() === '') {
        errors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
        errors.email = 'Invalid email format';
    }
    
    // Password validation
    if (!data.password) {
        errors.password = 'Password is required';
    } else if (data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    
    // Age validation
    const age = parseInt(data.age);
    if (!data.age || isNaN(age)) {
        errors.age = 'Valid age is required';
    } else if (age < 18) {
        errors.age = 'Minimum age is 18';
    } else if (age > 100) {
        errors.age = 'Maximum age is 100';
    }
    
    // Gender validation
    if (!data.gender) {
        errors.gender = 'Gender selection is required';
    }
    
    // Terms validation
    if (!data.terms) {
        errors.terms = 'You must accept the terms & conditions';
    }
    
    return errors;
}

// Submit endpoint with server-side validation
app.post('/submit', (req, res) => {
    const userData = req.body;
    
    // Server-side validation
    const validationErrors = validateUserData(userData);
    
    if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
            success: false,
            errors: validationErrors
        });
    }
    
    // Check for duplicate email (optional)
    const existingUser = userStorage.find(user => user.email === userData.email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            errors: { email: 'Email already registered' }
        });
    }
    
    // Prepare data for storage (remove password for security)
    const storedData = {
        id: Date.now(), // Simple ID generation
        username: userData.username,
        email: userData.email,
        age: parseInt(userData.age),
        gender: userData.gender,
        registeredAt: userData.timestamp || new Date().toISOString()
    };
    
    // Store in temporary storage
    userStorage.push(storedData);
    
    // Keep only last 50 registrations
    if (userStorage.length > 50) {
        userStorage.shift();
    }
    
    // Return success response
    res.json({
        success: true,
        message: 'Registration successful!',
        storedData: storedData,
        totalRegistrations: userStorage.length
    });
});

// Endpoint to view all stored data
app.get('/registrations', (req, res) => {
    res.json({
        total: userStorage.length,
        users: userStorage
    });
});

// Endpoint to clear storage (for testing)
app.delete('/clear-storage', (req, res) => {
    userStorage = [];
    res.json({
        success: true,
        message: 'Storage cleared successfully'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 View registrations: http://localhost:${PORT}/registrations`);
});