const express = require("express");
const router = express.Router();

/**
 * POST /api/tts
 * body: { text: "Kannada text to speak" }
 *
 * NOT YET IMPLEMENTED — same situation as asr.js. Real Kannada TTS
 * (AI4Bharat Indic-TTS or Coqui) needs a live API/model and isn't
 * runnable in this scaffold's environment.
 *
 * For NOW, the client uses the browser's built-in SpeechSynthesis API
 * as a working stand-in (quality is lower than a dedicated Indic-TTS
 * model, but it means the full loop — speak, get answer, hear answer —
 * actually works today with zero setup).
 *
 * Suggested production implementation:
 *
 *   const res = await fetch(
 *     "https://api-inference.huggingface.co/models/ai4bharat/indic-tts-coqui-kan",
 *     { method: "POST", headers: { Authorization: `Bearer ${HF_API_KEY}` },
 *       body: JSON.stringify({ inputs: text }) }
 *   );
 *   const audioBuffer = await res.arrayBuffer();
 *   res.set("Content-Type", "audio/wav").send(Buffer.from(audioBuffer));
 */
router.post("/", (req, res) => {
  res.status(501).json({
    error: "TTS_NOT_IMPLEMENTED",
    message:
      "Real Kannada TTS requires a Hugging Face API key and network access. " +
      "See the comments in server/src/routes/tts.js for the integration plan. " +
      "The client currently uses the browser's SpeechSynthesis API as a working stand-in.",
  });
});

module.exports = router;
