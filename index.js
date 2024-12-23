import fs from 'fs';
import os from 'os';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Mp3, 
         Mp4, 
         tiktokdl, 
         Lyrics,
         chatbot } from './exports/index.js';

const __filename = fileURLToPath(import.meta.url),
      __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());
const serverStartTime = Date.now();

const port = process.env.PORT || 3000;
app.enable('trust proxy');
app.set('json spaces', 2);
app.use(express.static(path.join(__dirname, 'public')));

const byteToKB = 1 / 1024,
      byteToMB = 1 / Math.pow(1024, 2),
      byteToGB = 1 / Math.pow(1024, 3);

// Utility Functions
function formatBytes(bytes) {
  if (bytes >= Math.pow(1024, 3)) {
    return (bytes * byteToGB).toFixed(2) + ' GB';
  } else if (bytes >= Math.pow(1024, 2)) {
    return (bytes * byteToMB).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes * byteToKB).toFixed(2) + ' KB';
  } else {
    return bytes.toFixed(2) + ' bytes';
  }
}

function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24)),
        h = Math.floor((seconds % (3600 * 24)) / 3600),
        m = Math.floor((seconds % 3600) / 60),
        s = Math.floor(seconds % 60),
        dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : '',
        hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : '',
        mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : '',
        sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}


const VISITOR_FILE = './visitors.json';
function initializeVisitorData() {
    if (!fs.existsSync(VISITOR_FILE)) {
        fs.writeFileSync(VISITOR_FILE, JSON.stringify({
            visitor_count: 0,
            visitor_today: 0,
            last_date: new Date().toISOString().split('T')[0]
        }));
    }
}

function getVisitorData() {
    return JSON.parse(fs.readFileSync(VISITOR_FILE));
}

function updateVisitorData() {
    const data = getVisitorData(),
          today = new Date().toISOString().split('T')[0];
    if (data.last_date !== today) {
        data.visitor_today = 0;
        data.last_date = today;
    }

    data.visitor_count += 1;
    data.visitor_today += 1;

    fs.writeFileSync(VISITOR_FILE, JSON.stringify(data));
    return data;
}

initializeVisitorData();

// Count Endpoint
app.get('/count', (req, res) => {
    const updatedData = updateVisitorData();
    res.json({
        visitor_count: updatedData.visitor_count,
        visitor_today: updatedData.visitor_today
    });
});


// Status Endpoint
app.get('/status', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000),
        totalMemoryBytes = os.totalmem(),
        freeMemoryBytes = os.freemem(),
        clientIP = req.ip || req.connection.remoteAddress;
  res.json({
    runtime: runtime(uptimeSeconds),
    memory: `${formatBytes(freeMemoryBytes)} / ${formatBytes(totalMemoryBytes)}`,
    yourip: clientIP,
  });
});


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


app.get('/lyrics/search', async (req, res) => {
  const { song } = req.query;
  if (!song) {
    return res.status(400).json({
      creator: 'David Cyril Tech',
      status: 400,
      success: false,
      error: 'Missing SONG parameter',
    });
  }
  try {
    const results = await Lyrics.search(song);
    res.json({
      creator: 'David Cyril Tech',
      status: 200,
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error fetching lyrics search:', error);
    res.status(500).json({
      creator: 'David Cyril Tech',
      status: 500,
      success: false,
      error: 'Internal Server Error',
    });
  }
});

app.get('/lyrics/details', async (req, res) => {
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
    const result = await Lyrics.getLyrics(url);
    res.json({
      creator: 'David Cyril Tech',
      status: 200,
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error fetching lyrics details:', error);
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

// TikTok Downloader Route
app.get('/ai/chatbot', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({
      creator: 'David Cyril Tech',
      status: 400,
      success: false,
      error: 'Missing QUERY parameter',
    });
  }
  try {
    const result = await chatbot.send(query);
    res.json({
      creator: 'David Cyril Tech',
      status: 200,
      success: true,
      result,
    });
  } catch (error) {
    console.error('Error fetching chatbot data:', error);
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
