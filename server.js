import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { nanoid } from "nanoid";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = process.env.SUPABASE_URL
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
  : null;

let localSpaces = [];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(dirname, "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "alive", supabase: !!supabase });
});

app.post("/api/spaces", async (req, res) => {
  const space = {
    id: nanoid(),
    name: req.body.name || "Untitled Space",
    config: req.body.config || {},
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    await supabase.from("spaces").insert(space);
  } else {
    localSpaces.push(space);
  }

  res.json(space);
});

app.get("/api/spaces", async (_req, res) => {
  if (supabase) {
    const { data } = await supabase.from("spaces").select("*");
    return res.json(data);
  }

  res.json(localSpaces);
});

app.post("/api/claude", async (req, res) => {
  const input = req.body.input || "";

  res.json({
    config: {
      name: "Generated Space",
      feed: "originality",
      ads: false,
      interaction: "gesture",
      aesthetic: "cinematic"
    },
    text: `Generated from: ${input}`
  });
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("VYBSTAK OS running on port " + PORT);
});
