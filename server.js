// server.js - UPGRADED FOR LIVE STREAMING!
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

app.get('/', (req, res) => {
    res.send('imoji server is alive!');
});

app.post('/get-ai-response', async (req, res) => {
    if (!apiKey) {
        return res.status(500).json({ error: { message: "API key is not configured on the server." } });
    }

    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: { message: "Prompt is required." } });
    }

    try {
        // Set headers for Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": referer,
                "X-Title": siteName,
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-chat-v3.1:free",
                "messages": [
                    { "role": "system", "content": "You are a helpful assistant. Always respond in clear, concise English." },
                    { "role": "user", "content": prompt }
                ],
                "stream": true // Enable streaming!
            })
        });

        if (!response.body) {
            throw new Error("Response body is null");
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.substring(6);
                    if (data === '[DONE]') {
                        res.write('event: done\ndata: {}\n\n'); // Signal end of stream
                        return;
                    }
                    res.write(`data: ${data}\n\n`); // Send data chunk to client
                }
            }
        }
    } catch (error) {
        console.error('Error streaming AI response:', error);
        res.write(`event: error\ndata: {"message": "Server-side error occurred."}\n\n`);
    } finally {
        res.end(); // End the response when done or on error
    }
});

app.listen(port, () => {
    console.log(`imoji server listening on port ${port}`);
});

