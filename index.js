import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import audioRoute from './routes/audio.js';
import dotenv from 'dotenv';


dotenv.config();

const app = express();
app.use(cors());

// Serve static files (HTML, CSS, JS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Use the audio route
app.use('/audio', audioRoute);

// port assigned by Render or default to 5000 locally
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});