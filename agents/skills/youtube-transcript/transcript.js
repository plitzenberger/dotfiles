#!/usr/bin/env node

import { YoutubeTranscript } from 'youtube-transcript-plus';
import { decode } from 'html-entities';

// --- Parse arguments ---
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const positional = args.filter(a => !a.startsWith('--'));
const videoId = positional[0];

const showLinks = flags.has('--links');
const showJson = flags.has('--json');

if (!videoId) {
  console.error(`Usage: transcript.js [options] <video-id-or-url>

Options:
  --links   Output timestamps as YouTube deep links [M:SS](url&t=Ns)
  --json    Output as JSON array [{offset, text, duration}]

Examples:
  transcript.js EBw7gsDPAYQ
  transcript.js --links https://www.youtube.com/watch?v=EBw7gsDPAYQ
  transcript.js --json https://youtu.be/EBw7gsDPAYQ`);
  process.exit(1);
}

// --- Extract video ID ---
let extractedId = videoId;
let inputUrl = videoId;

if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
  const match = videoId.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) extractedId = match[1];
} else {
  inputUrl = `https://www.youtube.com/watch?v=${videoId}`;
}

const videoUrl = `https://www.youtube.com/watch?v=${extractedId}`;

// --- Fetch and output ---
try {
  const transcript = await YoutubeTranscript.fetchTranscript(extractedId);

  if (!transcript || transcript.length === 0) {
    console.error('Error: No transcript entries returned. Video may not have captions.');
    process.exit(1);
  }

  // Validate timestamps — detect the /1000 bug or all-zero offsets
  const hasTimestamps = transcript.some(e => e.offset > 1);
  if (!hasTimestamps) {
    console.error('Warning: All offsets are near zero. Timestamps may be unreliable.');
  }

  if (showJson) {
    const entries = transcript.map(entry => ({
      offset: Math.round(entry.offset),
      timestamp: formatTimestamp(entry.offset),
      text: cleanText(entry.text),
      duration: Math.round(entry.duration * 10) / 10,
    }));
    console.log(JSON.stringify(entries, null, 2));
  } else {
    for (const entry of transcript) {
      const secs = Math.floor(entry.offset);
      const ts = formatTimestamp(entry.offset);
      const text = cleanText(entry.text);

      if (showLinks) {
        console.log(`[${ts}](${videoUrl}&t=${secs}s) ${text}`);
      } else {
        console.log(`[${ts}] ${text}`);
      }
    }
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error('');
  console.error('Fallback: try yt-dlp to fetch subtitles:');
  console.error(`  yt-dlp --skip-download --write-auto-sub --sub-langs "en" --sub-format vtt -o "/tmp/%(id)s.%(ext)s" "${videoUrl}"`);
  process.exit(1);
}

// --- Helpers ---

function formatTimestamp(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function cleanText(text) {
  // Decode HTML entities (&#39; → ', &amp; → &, etc.)
  let cleaned = decode(text);
  // Collapse newlines into spaces
  cleaned = cleaned.replace(/\n/g, ' ');
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}
