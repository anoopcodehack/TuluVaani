const express = require("express");
const router = express.Router();

/**
 * POST /api/asr
 * body: raw audio (multipart or base64 - not implemented here)
 *
 * NOT YET IMPLEMENTED — this is an integration point, not a real endpoint.
 *
 * Why it's a stub: real Kannada/Tulu ASR needs either
 *   (a) a Hugging Face Inference API call to IndicWav2Vec2 (needs
 *       HF_API_KEY + network access to huggingface.co), or
 *   (b) a locally-run model (needs a GPU and the model weights downloaded),
 * neither of which this scaffold's environment has. Wiring this up is
 * the first real task once you're running on your own machine or a
 * cloud instance with GPU/network access.
 *
 * For NOW, the client (see client/src/App.jsx) uses the browser's
 * built-in Web Speech API for speech-to-text as a working stand-in so
 * you can demo the full voice loop end-to-end today. Swap it for a real
 * call to this endpoint once IndicWav2Vec2 is wired in.
 *
 * Suggested implementation:
 *
 *   const formData = new FormData();
 *   formData.append("file", audioBuffer);
 *   const res = await fetch(
 *     "https://api-inference.huggingface.co/models/ai4bharat/indicwav2vec-kannada",
 *     { method: "POST", headers: { Authorization: `Bearer ${HF_API_KEY}` }, body: formData }
 *   );
 *   const { text } = await res.json();
 */
router.post("/", (req, res) => {
  res.status(501).json({
    error: "ASR_NOT_IMPLEMENTED",
    message:
      "Real Kannada/Tulu ASR requires a Hugging Face API key and network access. " +
      "See the comments in server/src/routes/asr.js for the integration plan. " +
      "The client currently uses the browser's Web Speech API as a working stand-in.",
  });
});

module.exports = router;
