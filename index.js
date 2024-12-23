import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Mp3, Mp4 } from './exports/youtube.js';
import { tiktokdl } from './exports/tiktok.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
app.enable('trust proxy');
app.set('json spaces', 2);
app.use(express.static(path.join(__dirname, 'public')));

// YouTube MP3 Downloader Route
app.get('/download/ytmp3', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({
      creator: 'David Cyril Tech',
      status: 400,
      success: false,
      error: 'Missing URL parameter',
    });
  }
  try {
    const result = await Mp3(url);
    res.json({
      creator: 'David Cyril Tech',
      status: 200,
      success: true,
      result: {
        type: result.type,
        quality: `${result.quality}kbps`,
        title: result.title,
        thumbnail: result.thumbnail,
        download_url: result.link,
      },
    });
  } catch (error) {
    console.error('Error fetching download URL:', error);
    res.status(500).json({
      creator: 'David Cyril Tech',
      status: 500,
      success: false,
      error: 'Internal Server Error',
    });
  }
});

// YouTube MP4 Downloader Route
app.get('/download/ytmp4', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({
      creator: 'David Cyril Tech',
      status: 400,
      success: false,
      error: 'Missing URL parameter',
    });
  }
  try {
    const result = await Mp4(url);
    res.json({
      creator: 'David Cyril Tech',
      status: 200,
      success: true,
      result: {
        type: result.type,
        quality: `${result.quality}p`,
        title: result.title,
        thumbnail: result.thumbnail,
        download_url: result.link,
      },
    });
  } catch (error) {
    console.error('Error fetching download URL:', error);
    res.status(500).json({
      creator: 'David Cyril Tech',
      status: 500,
      success: false,
      error: 'Internal Server Error',
    });
  }
});

// TikTok Downloader Route
app.get('/download/tiktok', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({
      creator: 'David Cyril Tech',
      status: 400,
      success: false,
      error: 'Missing URL parameter',
    });
  }
  try {
    const result = await tiktokdl(url);
    res.json({
      creator: 'David Cyril Tech',
      status: 200,
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error fetching TikTok data:', error);
    res.status(500).json({
      creator: 'David Cyril Tech',
      status: 500,
      success: false,
      error: 'Internal Server Error',
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/404/index.html'));
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
