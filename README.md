# Memoir

> A private memory keeper for the people who matter.

Log what happened, how it felt, what they said. Come back and remember. Everything stays in your browser.

## What you can log

| Type | Description |
|------|-------------|
| 📅 Event | What happened |
| 💭 Feeling | How you felt in the moment |
| 💬 Quote | Things they said that stuck |
| 🔍 Observation | Things you noticed about them |
| ⭐ Milestone | Turning points in the story |
| 🖼 Photo | Moments worth keeping |

## Features

- **Timeline view** — all entries grouped by month, scroll back through the whole story
- **Search** — find any entry instantly
- **Filter by type** — view only feelings, or only quotes, etc.
- **✦ Ask AI** — open a side panel and ask questions about this person based on your entries: "summarize our story", "what patterns do you notice", etc.
- **100% local** — all data stored in IndexedDB, never uploaded anywhere

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/memoir
cd memoir
npm install
npm start
```

Open `http://localhost:3000`. No API key needed to use the core features — only for the AI panel.

## AI Feature (optional)

Get your key at [console.anthropic.com](https://console.anthropic.com), enter it in ⚙ Settings. Uses `claude-sonnet-4-6`, ~$0.003 per query.

## Privacy

All entries are stored in your browser's IndexedDB. No server, no account, no tracking. Clear browser data to wipe everything.

---


