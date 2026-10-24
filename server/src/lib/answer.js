/**
 * answer.js
 *
 * Builds a grounded answer from retrieved documents.
 *
 * Two modes:
 *  - LLM mode (if HF_API_KEY or LLM_API_KEY is set): sends a constrained
 *    prompt to an LLM that may ONLY use the retrieved context.
 *  - Fallback mode (no API key): returns the most relevant retrieved
 *    passage directly, extractive-style. This is deliberately included
 *    so the whole pipeline is runnable and demoable with zero API keys —
 *    you should still swap in the LLM mode for the real submission, but
 *    this means nothing is fake or hardcoded while you're wiring things up.
 */

const NO_ANSWER_MESSAGE =
  "ಈ ಪ್ರಶ್ನೆಗೆ ಖಚಿತ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಹತ್ತಿರದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ ಅಥವಾ ಸರ್ಕಾರಿ ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ." +
  " (I couldn't find a confident answer. Please check with your nearest Raitha Samparka Kendra or government office.)";

function buildPrompt(query, contextDocs) {
  const context = contextDocs
    .map((d, i) => `[Doc ${i + 1}: ${d.title}]\n${d.text}`)
    .join("\n\n");

  return `You are a government scheme and agricultural advisory assistant for coastal Karnataka.

Rules:
- Answer ONLY using the information in the documents below.
- If the documents do not contain enough information to answer confidently, say so explicitly and suggest the user visit a local government office. Do NOT guess or use outside knowledge.
- Keep the answer short, simple, and in plain Kannada suitable for a text-to-speech system.

Documents:
${context}

Question: ${query}

Answer (grounded strictly in the documents above):`;
}

async function callLLM(prompt) {
  const apiKey = process.env.HF_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) return null; // caller falls back to extractive mode

  // --- Production integration point ---
  // Replace this with a real call to your chosen model, e.g. Hugging Face
  // Inference API or another LLM provider. Left unimplemented here since
  // it needs a live API key and network access this environment doesn't have.
  //
  // Example shape (Hugging Face Inference API):
  //
  // const res = await fetch("https://api-inference.huggingface.co/models/<model-id>", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${apiKey}` },
  //   body: JSON.stringify({ inputs: prompt }),
  // });
  // const data = await res.json();
  // return data[0]?.generated_text;

  throw new Error(
    "LLM_NOT_CONFIGURED: fill in the call to your chosen model in server/src/lib/answer.js"
  );
}

async function getAnswer(query, contextDocs) {
  if (contextDocs.length === 0) {
    return { answer: NO_ANSWER_MESSAGE, sources: [], mode: "no-context" };
  }

  const prompt = buildPrompt(query, contextDocs);

  try {
    const llmAnswer = await callLLM(prompt);
    if (llmAnswer) {
      return { answer: llmAnswer, sources: contextDocs.map((d) => d.title), mode: "llm" };
    }
  } catch (err) {
    // Falls through to extractive mode below — never crashes the request
  }

  // Fallback: extractive answer from the single best-matching document.
  // Real, runs with zero setup, but not as fluent as an LLM answer.
  const best = contextDocs[0];
  return {
    answer: `${best.title}: ${best.text}`,
    sources: [best.title],
    mode: "extractive-fallback",
  };
}

module.exports = { getAnswer, NO_ANSWER_MESSAGE };
