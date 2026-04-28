# VYBSTAK OS

A clean from-scratch VYBSTAK premium social UX prototype.

## Included

- Express backend
- Premium dark VYBSTAK UI
- WebGL atmospheric background
- VYBScore radar dashboard
- Claude API route for captions, post enhancement, tribe ideas and VYBScore insight
- Deezer search route for music context
- Railway-ready start command

## Local setup

```powershell
cd "C:\Users\Seb\Desktop\vybstak-os"
npm install
copy .env.example .env
notepad .env
npm start
```

Open:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

## Railway

Set these environment variables in Railway:

```text
ANTHROPIC_API_KEY=your_real_key
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Railway should detect `npm start`.
