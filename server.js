// server.js - v5.1 - Your secure AI gateway!
// This code will run on the Render server, not in the Chrome extension.

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
// Render will provide the PORT environment variable. We use 3000 as a backup.
const port = process.env.PORT || 3000;

// This allows your Chrome extension to talk to your server. Very important!
app.use(cors());
app.use(express.json());

// This is the main part of your server. It listens for requests from your extension.
app.post('/get-ai-response', async (req, res) => {
    const userPrompt = req.body.prompt;

    // This gets the secret API key from the Render dashboard. It's not in the code!
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Aiyo! The API key is not configured on the server.' });
    }

    if (!userPrompt) {
        return res.status(400).json({ error: 'No prompt was provided.' });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "X-Title": "imoji Extension",
                "HTTP-Referer": "https://github.com/scxr-dev/imoji-extension" 
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat-v3.1:free",
                "messages": [{ "role": "user", "content": userPrompt }]
            })
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error("Error calling OpenRouter:", error);
        res.status(500).json({ error: 'Failed to connect to the AI service.' });
    }
});

app.listen(port, () => {
    console.log(`imoji server is listening on port ${port}`);
});

