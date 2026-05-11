import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initDb } from "./database/db.js";
import { progressRouter } from "./routes/progress.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 4000);

initDb();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/progress", progressRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "jimmys-lab" });
});

const distPath = path.resolve(__dirname, "../frontend/dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (error) => {
    if (error) {
      res.status(200).send("Jimmy's Lab API is running. Start the frontend with npm run dev:frontend.");
    }
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Jimmy's Lab backend running on http://localhost:${port}`);
});
