require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
// Import fetch for Node.js versions that don't have it globally
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// Import stream utilities
const { Readable } = require('stream');
const app = express();

// Increase payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static('.')); // Serve files from the current directory

// Proxy endpoint for Gemini API
app.post('/api/generate', async (req, res) => {
    try {
        // Handle streaming properly
        res.setHeader('Content-Type', 'application/json');
        
        // Get the Gemini API key
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error('GEMINI_API_KEY environment variable is not set');
            return res.status(500).json({ error: 'Missing Gemini API key. Please set the GEMINI_API_KEY environment variable.' });
        }
        
        // Forward the request to the Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:streamGenerateContent?key=${apiKey}`;
        console.log(`Sending request to Gemini API at: ${apiUrl.replace(apiKey, 'REDACTED')}`);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        // Stream the response back to the client
        if (!response.ok) {
            console.error(`Gemini API error: ${response.status} ${response.statusText}`);
            const errorData = await response.json();
            console.error('API error details:', JSON.stringify(errorData));
            return res.status(response.status).json(errorData);
        }
        
        // Properly handle streaming in Node.js
        if (response.body) {
            // Convert the fetch body to a Node.js readable stream
            const nodeStream = Readable.from(response.body);
            nodeStream.pipe(res);
        } else {
            console.error('No response body received from Gemini API');
            return res.status(500).json({ error: 'No response body from API' });
        }
    } catch (error) {
        console.error('Error in /api/generate endpoint:', error);
        res.status(500).json({ error: 'Failed to generate image', details: error.message });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 