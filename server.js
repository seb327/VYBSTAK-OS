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
  res.json({ status: "alive" });
});

app.post("/api/claude", async function (req, res) {
  const body = req.body || {};
  const task = cleanText(body.task || "");
  const input = cleanText(body.input || "");

  if(task==="space-builder"){
    return res.json({success:true,text:`Platform idea:\n${input}\n\nFeed: originality first\nAds: off\nInteractions: gesture wheel\nAesthetic: cinematic`});
  }

  return res.json({success:true,text:"OK"});
});

app.get("/", function (_req, res) {
  res.sendFile(path.join(dirname, "public", "index.html"));
});

app.listen(PORT, function () {
  console.log("VYBSTAK OS running on port " + PORT);
});
