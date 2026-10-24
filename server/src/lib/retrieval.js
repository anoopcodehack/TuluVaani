/**
 * retrieval.js
 *
 * A small, dependency-free TF-IDF + cosine-similarity retriever.
 *
 * This is the ONE piece of the pipeline that is fully real and runnable
 * right now, with no API keys and no internet access. It's intentionally
 * simple (word-overlap based, not a neural embedding model) so you can
 * demo end-to-end retrieval today, then swap this out for a proper
 * multilingual sentence-transformer embedding model later without
 * changing anything else in the pipeline.
 *
 * Swap-out point for production: replace `embed()` below with a call to
 * a Hugging Face multilingual sentence-transformers model, and replace
 * the in-memory `documents` array with a real vector store (Chroma/FAISS).
 */

const fs = require("fs");
const path = require("path");

const documents = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/schemes.json"), "utf-8")
);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9ಂ-೿\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildVocabulary(docs) {
  const vocab = new Set();
  docs.forEach((doc) => tokenize(doc.text).forEach((t) => vocab.add(t)));
  return Array.from(vocab);
}

function termFrequency(tokens) {
  const tf = {};
  tokens.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
  const len = tokens.length || 1;
  Object.keys(tf).forEach((k) => (tf[k] = tf[k] / len));
  return tf;
}

function inverseDocumentFrequency(vocab, tokenizedDocs) {
  const idf = {};
  const n = tokenizedDocs.length;
  vocab.forEach((term) => {
    const containing = tokenizedDocs.filter((tokens) => tokens.includes(term)).length;
    idf[term] = Math.log((n + 1) / (containing + 1)) + 1;
  });
  return idf;
}

function vectorize(tf, idf, vocab) {
  return vocab.map((term) => (tf[term] || 0) * (idf[term] || 0));
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Precompute once at startup
const tokenizedDocs = documents.map((d) => tokenize(d.text));
const vocab = buildVocabulary(documents);
const idf = inverseDocumentFrequency(vocab, tokenizedDocs);
const docVectors = tokenizedDocs.map((tokens) =>
  vectorize(termFrequency(tokens), idf, vocab)
);

/**
 * Returns the top-k most relevant documents for a query, each with a
 * similarity score. Returns an empty array if nothing clears the
 * minimum relevance threshold — the caller should treat that as
 * "don't answer, say you're not sure" rather than forcing an answer.
 */
function retrieve(query, { topK = 3, minScore = 0.05 } = {}) {
  const queryTokens = tokenize(query);
  const queryVec = vectorize(termFrequency(queryTokens), idf, vocab);

  const scored = documents.map((doc, i) => ({
    ...doc,
    score: cosineSimilarity(queryVec, docVectors[i]),
  }));

  return scored
    .filter((d) => d.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

module.exports = { retrieve };
