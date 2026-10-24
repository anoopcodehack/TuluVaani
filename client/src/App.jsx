import { useRef, useState } from "react";

/**
 * This UI uses the browser's built-in SpeechRecognition and
 * SpeechSynthesis APIs as a working stand-in for the real
 * IndicWav2Vec ASR / Indic-TTS models (see server/src/routes/asr.js
 * and tts.js for why those aren't wired up in this scaffold).
 *
 * That means: this demo actually works end-to-end today in Chrome,
 * with real Kannada speech in and spoken Kannada out — just with
 * lower accuracy than the production models would give, and no
 * Tulu support at all (browsers don't support Tulu speech).
 */

const KANNADA_LANG = "kn-IN";

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  function startListening() {
    setError(null);
    setResult(null);
    setTranscript("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "This browser doesn't support the Web Speech API. Try Chrome, or type your question below instead."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = KANNADA_LANG;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setStatus("listening");
    recognition.onerror = (e) => {
      setError(`Speech recognition error: ${e.error}`);
      setStatus("idle");
    };
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      askBackend(text);
    };
    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  async function askBackend(text) {
    setStatus("thinking");
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
      speak(data.answer);
    } catch (err) {
      setError("Couldn't reach the server. Is `npm run dev` running in /server?");
      setStatus("idle");
    }
  }

  function speak(text) {
    setStatus("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = KANNADA_LANG;
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  async function submitTyped(e) {
    e.preventDefault();
    const text = e.target.elements.typedQuery.value.trim();
    if (!text) return;
    setTranscript(text);
    askBackend(text);
  }

  return (
    <div className="page">
      <header className="header">
        <h1>TuluVaani</h1>
        <p className="tagline">
          Voice assistant for Karnataka govt schemes &amp; coastal advisory
        </p>
      </header>

      <main className="main">
        <button
          className={`mic-button ${status === "listening" ? "listening" : ""}`}
          onClick={startListening}
          disabled={status === "listening" || status === "thinking"}
        >
          🎤
        </button>

        <p className="status-label">
          {status === "idle" && "Tap to ask a question (Kannada)"}
          {status === "listening" && "Listening..."}
          {status === "thinking" && "Finding an answer..."}
          {status === "speaking" && "Speaking..."}
        </p>

        <form className="typed-form" onSubmit={submitTyped}>
          <input
            name="typedQuery"
            type="text"
            placeholder="Or type a question (e.g. areca nut disease)"
          />
          <button type="submit">Ask</button>
        </form>

        {error && <div className="card error">{error}</div>}

        {transcript && (
          <div className="card">
            <strong>You asked:</strong>
            <p>{transcript}</p>
          </div>
        )}

        {result && (
          <div className="card answer">
            <strong>Answer:</strong>
            <p>{result.answer}</p>
            {result.sources?.length > 0 && (
              <p className="sources">Source: {result.sources.join(", ")}</p>
            )}
            <p className="mode-tag">mode: {result.mode}</p>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          Demo uses browser speech APIs as a stand-in for the real Tulu/Kannada
          ASR + TTS pipeline. See README §5.
        </p>
      </footer>
    </div>
  );
}
