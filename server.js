require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
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
        
        // Forward the request to the Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:streamGenerateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });
        
        // Stream the response back to the client
        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }
        
        response.body.pipe(res);
    } catch (error) {
        console.error('Error:', error);
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