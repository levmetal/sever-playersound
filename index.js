import express from 'express';
import axios from 'axios';
import path from 'path';
import cors from 'cors';  // Importing cors module

// Use the `fileURLToPath` and `URL` classes to correctly resolve paths in ES modules
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize the server
const app = express();

// Middleware CORS
app.use(cors());

// Serve static files (HTML, CSS, JS, etc.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Route to fetch audio from inv.nadeko.net
app.get('/audio', async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send('Missing video ID');
  }

  try {
    const baseUrl = `https://inv.nadeko.net/latest_version?id=${videoId}&itag=18&local=true`;

    const response = await axios.get(baseUrl, {
      maxRedirects: 0,
      validateStatus: function (status) {
        return status >= 300 && status < 400;
      }
    });

    const relativeUrl = response.headers.location;
    const finalUrl = `https://inv.nadeko.net${relativeUrl}`;

    res.json({ audioUrl: finalUrl });
  } catch (error) {
    console.error('Error fetching redirect URL:', error);
    res.status(500).send('Error fetching redirect URL');
  }
});

// Use the port assigned by Render or default to 4000 locally
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});