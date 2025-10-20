// server.js - v16.0 - Perfectly matched to the Zero Error JavaScript Extension
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENROUTER_API_KEY;
const referer = "https://github.com/scxr-dev/imoji-server";
const siteName = "Imoji Chrome Extension";

app.get('/', (req, res) => res.send('imoji server is alive!'));

app.post('/get-ai-response', async (req, res) => {
    if (!apiKey) {
        return res.status(500).json({ error: { message: "API key is not configured on the server." } });
    }

    const { prompt, model } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: { message: "Prompt is required." } });
    }

    // Use the model sent from the extension, or a reliable default
    const selectedModel = model || 'deepseek/deepseek-chat:free';

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": referer,
                "X-Title": siteName,
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { "role": "system", "content": "You are a helpful assistant. Always respond in clear, concise English." },
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenRouter Error:", errorBody);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching AI response:', error);
        res.status(500).json({ error: { message: "An error occurred on the imoji server." } });
    }
});

app.listen(port, () => {
    console.log(`imoji server listening on port ${port}`);
});

