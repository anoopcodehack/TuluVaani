const express = require("express");
const { retrieve } = require("../lib/retrieval");
const { getAnswer } = require("../lib/answer");

const router = express.Router();

/**
 * POST /api/query
 * body: { text: "user question, already transcribed" }
 *
 * This is the real, fully working core of the pipeline: retrieval +
 * grounded answer. It's transport-agnostic — the ASR route below just
 * needs to produce text and hand it to this same function.
 */
router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  const contextDocs = retrieve(text);
  const result = await getAnswer(text, contextDocs);

  res.json({
    query: text,
    answer: result.answer,
    sources: result.sources,
    mode: result.mode, // "llm" | "extractive-fallback" | "no-context"
    retrievedCount: contextDocs.length,
  });
});

module.exports = router;
