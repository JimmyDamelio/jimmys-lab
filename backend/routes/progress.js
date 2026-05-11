import { Router } from "express";
import { all, get, run } from "../database/db.js";

export const progressRouter = Router();

progressRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await all("SELECT * FROM progress ORDER BY updated_at DESC"));
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/labs", async (_req, res, next) => {
  try {
    res.json(await all("SELECT * FROM lab_progress ORDER BY updated_at DESC"));
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/export", async (_req, res, next) => {
  try {
    const [progress, labProgress, quizAttempts, notes, labRuns] = await Promise.all([
      all("SELECT * FROM progress ORDER BY updated_at DESC"),
      all("SELECT * FROM lab_progress ORDER BY updated_at DESC"),
      all("SELECT * FROM quiz_attempts ORDER BY created_at DESC LIMIT 1000"),
      all("SELECT * FROM notes ORDER BY updated_at DESC"),
      all("SELECT * FROM lab_runs ORDER BY created_at DESC LIMIT 500")
    ]);
    res.json({
      exported_at: new Date().toISOString(),
      progress,
      lab_progress: labProgress,
      quiz_attempts: quizAttempts,
      notes,
      lab_runs: labRuns
    });
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/:lessonId", async (req, res, next) => {
  try {
    const { completed = false, score = 0 } = req.body;
    await run(
      `INSERT INTO progress (lesson_id, completed, score, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(lesson_id) DO UPDATE SET
       completed = excluded.completed,
       score = MAX(progress.score, excluded.score),
       updated_at = CURRENT_TIMESTAMP`,
      [req.params.lessonId, completed ? 1 : 0, Number(score)]
    );
    res.json(await get("SELECT * FROM progress WHERE lesson_id = ?", [req.params.lessonId]));
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/:lessonId/attempts", async (req, res, next) => {
  try {
    res.json(await all("SELECT * FROM quiz_attempts WHERE lesson_id = ? ORDER BY created_at DESC LIMIT 10", [req.params.lessonId]));
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/:lessonId/attempts", async (req, res, next) => {
  try {
    const { score = 0, passed = false, answers = {} } = req.body;
    const result = await run(
      "INSERT INTO quiz_attempts (lesson_id, score, passed, answers) VALUES (?, ?, ?, ?)",
      [req.params.lessonId, Number(score), passed ? 1 : 0, JSON.stringify(answers)]
    );
    res.json(await get("SELECT * FROM quiz_attempts WHERE id = ?", [result.id]));
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/:lessonId/lab", async (req, res, next) => {
  try {
    const { completed = true, evidence = "" } = req.body;
    await run(
      `INSERT INTO lab_progress (lesson_id, completed, evidence, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(lesson_id) DO UPDATE SET
       completed = excluded.completed,
       evidence = excluded.evidence,
       updated_at = CURRENT_TIMESTAMP`,
      [req.params.lessonId, completed ? 1 : 0, String(evidence ?? "")]
    );
    res.json(await get("SELECT * FROM lab_progress WHERE lesson_id = ?", [req.params.lessonId]));
  } catch (error) {
    next(error);
  }
});

progressRouter.get("/:lessonId/notes", async (req, res, next) => {
  try {
    const row = await get("SELECT content FROM notes WHERE lesson_id = ?", [req.params.lessonId]);
    res.json({ content: row?.content ?? "" });
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/:lessonId/notes", async (req, res, next) => {
  try {
    await run(
      `INSERT INTO notes (lesson_id, content, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(lesson_id) DO UPDATE SET
       content = excluded.content,
       updated_at = CURRENT_TIMESTAMP`,
      [req.params.lessonId, String(req.body.content ?? "")]
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

progressRouter.post("/:lessonId/lab-run", async (req, res, next) => {
  try {
    const result = await run(
      "INSERT INTO lab_runs (lesson_id, command, output) VALUES (?, ?, ?)",
      [req.params.lessonId, String(req.body.command ?? ""), String(req.body.output ?? "")]
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});
