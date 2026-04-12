---
name: youtube-transcript
description: |
  Fetch timestamped transcripts from YouTube videos for summarization,
  note-taking, and analysis. Use when user shares a YouTube URL and asks
  for transcript, subtitles, captions, or "what did they say at X:XX".
  Also trigger when: summarize this video, transcribe this, get the
  transcript, fetch captions, add transcript to note.
  Supports plain text, clickable YouTube deep links, and JSON output.
  Do NOT use for video metadata (title, views, duration) — use
  youtube-metadata. Do NOT use for channel-level scraping — use
  youtube-account-scrape.
allowed-tools:
  - Bash({baseDir}/transcript.js *)
  - Bash(yt-dlp:*)
  - Bash(python3:*)
  - Read
  - Write
---

# YouTube Transcript

Fetch timestamped transcripts from YouTube videos. Supports plain text,
Obsidian-compatible deep links, and structured JSON.

## Setup

```bash
cd {baseDir}
npm install
```

Verify: `{baseDir}/transcript.js --help` should print usage.

## Usage

### Primary: transcript.js

```bash
# Plain timestamped text
{baseDir}/transcript.js <video-id-or-url>

# Clickable YouTube deep links (for Obsidian notes)
{baseDir}/transcript.js --links <video-id-or-url>

# Structured JSON
{baseDir}/transcript.js --json <video-id-or-url>
```

Accepts video ID or full URL:
- `EBw7gsDPAYQ`
- `https://www.youtube.com/watch?v=EBw7gsDPAYQ`
- `https://youtu.be/EBw7gsDPAYQ`

### Output Formats

**Plain** (default):
```
[0:00] All right. So, I got this UniFi Theta
[0:15] I took the camera out, painted it
[1:23] And here's the final result
```

**Links** (`--links`) — each timestamp opens YouTube at that moment:
```
[0:00](https://www.youtube.com/watch?v=EBw7gsDPAYQ&t=0s) All right. So, I got this UniFi Theta
[0:15](https://www.youtube.com/watch?v=EBw7gsDPAYQ&t=15s) I took the camera out, painted it
[1:23](https://www.youtube.com/watch?v=EBw7gsDPAYQ&t=83s) And here's the final result
```

**JSON** (`--json`):
```json
[{"offset": 0, "timestamp": "0:00", "text": "All right...", "duration": 4.2}]
```

## Workflow

1. **Extract video ID** from URL
2. **Run transcript.js** with appropriate flags
3. **Check output** — verify timestamps are not all `0:00`
4. **If it fails**, use the yt-dlp fallback (see below)
5. **Save output** to the target file

### Choosing the right flag

| Use case | Flag |
|----------|------|
| Summarization / analysis | (none) — plain text |
| Obsidian vault notes | `--links` — clickable timestamps |
| Programmatic processing | `--json` — structured data |

## Fallback: yt-dlp VTT

When `transcript.js` fails (no captions via API, geo-blocked, etc.), use
yt-dlp to download VTT subtitles and convert:

```bash
# Step 1: Download VTT
yt-dlp --skip-download --write-auto-sub --sub-langs "en" --sub-format vtt \
  -o "/tmp/%(id)s.%(ext)s" "<youtube-url>"

# Step 2: Convert VTT to timestamped text
python3 -c "
import re, sys
with open(sys.argv[1]) as f: content = f.read()
lines, seen = [], set()
ts = None
for line in content.split('\n'):
    m = re.match(r'(\d{2}:\d{2}:\d{2})\.\d+ --> ', line)
    if m: ts = m.group(1); continue
    if '<' in line and '>' in line: continue
    text = line.strip()
    if not text or text in seen: continue
    if text in ('WEBVTT',) or text.startswith(('Kind:','Language:')): continue
    seen.add(text)
    if ts:
        h,m2,s = ts.split(':')
        fmt = f'{int(m2)}:{s}' if h == '00' else f'{int(h)}:{m2}:{s}'
        lines.append(f'[{fmt}] {text}')
print('\n'.join(lines))
" /tmp/<video-id>.en.vtt
```

<!-- The VTT fallback produces slightly different line breaks than
     transcript.js because auto-captions chunk text differently.
     Both are valid; transcript.js gives cleaner sentence boundaries. -->

## Rules

- **Always use `--links` when saving to Obsidian vault notes** — timestamps
  should be clickable YouTube deep links, not plain text
- **Verify timestamps are not all zero** — if every line shows `[0:00]`,
  the transcript source is broken; switch to yt-dlp fallback
- **Do NOT pipe raw output through an LLM for "cleaning"** — this loses
  timestamps and introduces hallucinated text
- **Do NOT strip timestamps** when saving — they are the primary navigation
  mechanism in the transcript
- **HTML entities are auto-decoded** — `&#39;` → `'`, `&amp;` → `&`
- **Newlines within entries are collapsed** — multi-line captions become
  single lines for cleaner output

## Verification

After fetching a transcript, verify:

```bash
# Check line count is reasonable (most videos: 50-1000 lines)
wc -l < output.md

# Check timestamps are incrementing (not all zero)
head -5 output.md   # first few should be [0:XX]
tail -5 output.md   # last few should be [M:SS] or [H:MM:SS]

# If using --links, check URL format
grep -c 'youtube.com/watch' output.md  # should equal line count
```

## Examples

**Typical — fetch transcript for a vault note:**
```bash
{baseDir}/transcript.js --links "https://www.youtube.com/watch?v=EBw7gsDPAYQ" > transcript.md
```

**Batch — multiple videos:**
```bash
for vid in "abc123" "def456" "ghi789"; do
  {baseDir}/transcript.js --links "$vid" > "/tmp/${vid}.md" &
done
wait
```

**Failure — no captions available:**
```
Error: Could not retrieve transcript for video XYZ

Fallback: try yt-dlp to fetch subtitles:
  yt-dlp --skip-download --write-auto-sub --sub-langs "en" --sub-format vtt ...
```
→ Follow the yt-dlp fallback workflow above.
