const express = require('express'); // Import the express library

const app = express(); // Initialize the express application
const PORT = process.env.PORT || 3000; // Define the port, using an environment variable or defaulting to 3000

// Middleware to parse JSON payloads in requests
app.use(express.json());

// Define a basic route for the root URL ('/')
app.get('/', (req, res) => {
    // Send a plain text response
    res.send('Hello, Express!');
});

// Example API route that returns JSON data
app.get('/api/status', (req, res) => {
    // Send a JSON response
    res.json({
        status: 'up',
        timestamp: new Date().toISOString()
    });
});

// Generic 404 handler for routes that are not defined
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});