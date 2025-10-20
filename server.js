// server.js - v2.0 - Now with a system prompt to force English!
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from your extension

// This is the secret key you stored on Railway
const apiKey = process.env.OPENROUTER_API_KEY;

app.post('/get-ai-response', async (req, res) => {
    if (!apiKey) {
        return res.status(500).json({ error: { message: 'API key is not configured on the server.' } });
    }

    const { prompt } = req.body;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": `https://github.com/scxr-dev/imoji-server`,
                "X-Title": `imoji Chrome Extension`
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat-v3.1:free",
                "messages": [
                    // THIS IS THE NEW PART!
                    // This is a special instruction we give the AI on every single request.
                    { "role": "system", "content": "You are a helpful assistant. Always respond in English." },
                    
                    // And here is the user's actual question
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) {
            // If the response is not good, send the error back to the extension
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: { message: 'An error occurred on the server.' } });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

