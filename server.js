import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = process.env.PORT || 3000;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

app.use(cors());
app.use(express.json({ limit: "4mb" }));
app.use(express.static(path.join(dirname, "public")));

function cleanText(value) {
  return String(value || "").replace(/[<>]/g, "").slice(0, 3000);
}

app.get("/api/health", function (_req, res) {
  res.json({
    status: "alive",
    service: "VYBSTAK OS",
    claudeConnected: Boolean(ANTHROPIC_API_KEY),
    model: ANTHROPIC_MODEL
  });
});

app.post("/api/claude", async function (req, res) {
  try {
    const body = req.body || {};
    const task = cleanText(body.task || "caption");
    const input = cleanText(body.input || "");
    const context = body.context || {};

    if (!ANTHROPIC_API_KEY) {
      return res.json({
        success: true,
        fallback: true,
        text: localFallback(task)
      });
    }

    const prompt = buildPrompt(task, input, context);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 900,
        temperature: 0.72,
        system: "You are Claude inside VYBSTAK OS, a premium creator-first social platform. The tone is cinematic, sharp, human, anti-vanity metrics, and premium. Use UK English. Avoid fluff.",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const raw = await response.text();
    let data;

    try {
      data = JSON.parse(raw);
    } catch (_error) {
      return res.status(500).json({
        success: false,
        error: "Invalid Claude response: " + raw.slice(0, 200)
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error && data.error.message ? data.error.message : "Claude request failed"
      });
    }

    const text =
      data.content &&
      data.content[0] &&
      data.content[0].text
        ? data.content[0].text
        : "";

    res.json({
      success: true,
      text: text
    });
  } catch (error) {
    console.error("[CLAUDE]", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get("/api/deezer/search", async function (req, res) {
  try {
    const q = cleanText(req.query.q || "cinematic electronic");
    const deezerUrl = "https://api.deezer.com/search?q=" + encodeURIComponent(q) + "&limit=12";

    const response = await fetch(deezerUrl);
    const data = await response.json();

    const tracks = (data.data || []).map(function (track) {
      return {
        id: track.id,
        title: track.title || "",
        artist: track.artist && track.artist.name ? track.artist.name : "",
        album: track.album && track.album.title ? track.album.title : "",
        cover: track.album && track.album.cover_medium ? track.album.cover_medium : "",
        preview: track.preview || "",
        link: track.link || "",
        duration: track.duration || 0
      };
    });

    res.json({
      success: true,
      tracks: tracks
    });
  } catch (error) {
    console.error("[DEEZER]", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

function buildPrompt(task, input, context) {
  const ctx = JSON.stringify(context || {}, null, 2);

  if (task === "caption") {
    return "Create 5 premium VYBSTAK caption options for this post.\n\nInput:\n" + input + "\n\nContext:\n" + ctx + "\n\nMake them short, sharp, human, premium and creator-first. No hashtags unless asked.";
  }

  if (task === "post-enhance") {
    return "Improve this VYBSTAK post. Return:\n1. Stronger caption\n2. Visual direction\n3. Best Tribe\n4. Ideal music search term\n5. Why people would react VYBZ, MEH or NOPE\n\nInput:\n" + input + "\n\nContext:\n" + ctx;
  }

  if (task === "score-insight") {
    return "Give a VYBSTAK creator insight based on this VYBScore data. Be honest, premium and motivating.\n\nCreator note:\n" + input + "\n\nData:\n" + ctx;
  }

  if (task === "tribe") {
    return "Create a premium VYBSTAK Tribe concept from this idea. Return name, purpose, vibe, rules and visual identity.\n\nIdea:\n" + input;
  }

  return "Help with this VYBSTAK creator task:\n" + input + "\n\nContext:\n" + ctx;
}

function localFallback(task) {
  if (task === "caption") {
    return "1. Built for signal, not noise.\n2. The creator is the asset. Not the product.\n3. No vanity. No manipulation. Just real reaction.\n4. A new kind of feed is forming.\n5. The future belongs to creators.";
  }

  if (task === "post-enhance") {
    return "Stronger caption: Built for signal, not noise.\n\nVisual direction: darker contrast, closer crop, stronger subject focus and subtle terracotta glow.\n\nBest Tribe: Founders or Film Tribe.\n\nIdeal music search: cinematic electronic tension.\n\nWhy it lands: it gives people a clear idea, a strong mood and a reason to react honestly.";
  }

  if (task === "score-insight") {
    return "Your signal is forming. Originality is strong, but consistency is the next unlock. The strongest creators are not chasing applause, they are building repeatable taste.";
  }

  return "Claude fallback is active. Add ANTHROPIC_API_KEY to unlock live Claude responses.";
}

app.get("/", function (_req, res) {
  res.sendFile(path.join(dirname, "public", "index.html"));
});

app.use(function (_req, res) {
  res.sendFile(path.join(dirname, "public", "index.html"));
});

app.listen(PORT, function () {
  console.log("VYBSTAK OS running on port " + PORT);
  console.log("Claude connected: " + Boolean(ANTHROPIC_API_KEY));
});
