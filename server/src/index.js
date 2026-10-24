require("dotenv").config();
const express = require("express");
const cors = require("cors");

const queryRoute = require("./routes/query");
const asrRoute = require("./routes/asr");
const ttsRoute = require("./routes/tts");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "tuluvaani-server" });
});

app.use("/api/query", queryRoute); // real, working retrieval + answer pipeline
app.use("/api/asr", asrRoute); // stub — see comments in the file
app.use("/api/tts", ttsRoute); // stub — see comments in the file

app.listen(PORT, () => {
  console.log(`TuluVaani server running on http://localhost:${PORT}`);
  console.log(`Try: curl -X POST http://localhost:${PORT}/api/query -H "Content-Type: application/json" -d '{"text":"areca nut disease"}'`);
});
