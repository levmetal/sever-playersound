import express from 'express';
import ytdl from '@distube/ytdl-core';

const router = express.Router();

router.get('/', async (req, res) => {
  const videoId = req.query.id;

  if (!videoId) {
    return res.status(400).send('Missing video ID');
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

    if (!audioFormats.length) {
      return res.status(404).send('No audio formats found for this video.');
    }

    const bestAudioFormat = audioFormats.sort((a, b) => {
      const aBitrate = a.audioBitrate || 0;
      const bBitrate = b.audioBitrate || 0;
      return bBitrate - aBitrate;
    })[0];

    if (!bestAudioFormat || !bestAudioFormat.url) {
      return res.status(500).send('Could not get audio stream URL.');
    }

    const audioURL = bestAudioFormat.url;
    res.json({ audioUrl: audioURL });

  } catch (error) {
    console.error(`Error fetching redirect URL for video ID ${videoId}:`, error.message);
    res.status(500).send('Error fetching redirect URL');
  }
});

export default router;