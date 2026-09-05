# TuluVaani 🎙️
### A first-attempt Tulu speech pipeline — demonstrated through a coastal Karnataka scheme & fisheries advisory assistant

> *"vaani" (ವಾಣಿ) = voice.* Tulu (ತುಳು) is spoken by ~1.8–2.5 million people in coastal Karnataka and Kasaragod, Kerala — and has no usable open-source speech recognition or synthesis today.

---

## 1. What This Project Actually Is

This is **not** "another government-scheme chatbot." That category is already solved at national scale (see §3). What isn't solved is **Tulu speech technology** — and that's the actual contribution here.

The project has two layers, and they're not equally weighted:

| Layer | What it is | Why it matters |
|---|---|---|
| **Core contribution** | A first-attempt Tulu ASR pipeline, fine-tuned from a Kannada speech model on a small self-collected Tulu dataset | This is the genuinely novel, citable part — an open research gap, not a wrapper around an existing API |
| **Demonstration use case** | A voice-based government scheme & fisheries/agri advisory assistant for coastal Karnataka, in Kannada + (limited) Tulu | Proves the speech pipeline is useful for something real, without pretending the chatbot layer itself is novel |

Being upfront about this distinction is deliberate — it's the difference between "I built app #N in a solved category" and "I identified an unsolved problem and built a first, honestly-evaluated attempt at it."

## 2. The Problem

- Tulu has no meaningful digital speech infrastructure. No production ASR, no TTS, nothing a developer can plug in today.
- Coastal Karnataka's Tulu-speaking population — including fisherfolk, elderly citizens, and small farmers — is invisible to every major language-inclusion initiative in Indian GovTech, because none of them go past Kannada.
- Existing scheme-advisory chatbots (see below) are farmer-centric and miss fisheries-specific schemes and coastal advisory needs entirely.

## 3. Prior Art — What Already Exists (and what doesn't)

Being accurate here matters more than sounding original.

**Already solved, don't rebuild:**
- **Kisan e-Mitra** (Ministry of Agriculture, 2023) — voice-enabled chatbot for PM-KISAN, crop insurance, and loan queries, in 11 languages including Kannada, built on Bhashini's IndicTrans2.
- **AI4Bharat's IndicWav2Vec** — solid open-source ASR covering major Indic languages, including Kannada.

**Confirmed still open:**
- No production Tulu ASR or TTS pipeline exists. Academic attempts are small-scale (one published Tulu ASR effort used only ~7 hours of audio).
- A Tulu-English text dataset (FLORES-200 extension) exists, built by **Jai Tulunad**, a Mangaluru-based volunteer language organization — useful for translation, not speech.
- No fisheries-specific or Karnataka state-scheme voice assistant exists in any language.

This project sits precisely in that gap: **Tulu speech + coastal-specific advisory**, neither of which is covered by existing solutions.

## 4. Core Contribution: The Tulu ASR Pipeline

```
[1] Data Collection
      │   Small, targeted Tulu speech corpus (few hours) —
      │   scheme/agri/fisheries vocabulary + common phrases,
      │   recorded from local volunteer speakers
      │   (potential collaboration: Jai Tulunad, Mangaluru)
      ▼
[2] Transfer Learning
      │   Fine-tune IndicWav2Vec (Kannada-pretrained) on the
      │   Tulu dataset — justified because Tulu code-mixes
      │   heavily with Kannada, making Kannada-pretrained
      │   weights a legitimate starting point, not a hack
      ▼
[3] Honest Evaluation
      │   Word Error Rate reported plainly, including failure
      │   cases — no inflated claims of "solving" Tulu ASR
      ▼
[4] Applied Demo
          Wrapped into the voice-advisory assistant below,
          as evidence the pipeline is usable, not just a
          benchmark number
```

## 5. Applied Demo: Voice Advisory Assistant

The downstream application that puts the ASR pipeline to work — scoped honestly as a demo, not a claimed production system.

```
🎤 User speaks (Kannada, or Tulu where pipeline supports it)
      │
      ▼
[ASR]  → IndicWav2Vec (Kannada) / fine-tuned Tulu model
      │
      ▼
[Retrieval]  → Vector search over a curated corpus of:
      │           - Karnataka state schemes (Raitha Vidya Nidhi,
      │             Krishi Bhagya, Bhoochetana)
      │           - Fisheries schemes (PM Matsya Sampada Yojana)
      │           - Coastal crop advisory (areca nut, coconut)
      ▼
[Constrained LLM]  → Answers ONLY from retrieved documents;
      │                explicitly says "not sure, visit [office]"
      │                if retrieval is weak — no hallucinated
      │                eligibility criteria or amounts
      ▼
[TTS]  → AI4Bharat Indic-TTS (Kannada) / Tulu where available
      ▼
🔊 Spoken answer
```

## 6. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Base ASR model | IndicWav2Vec2 (AI4Bharat), Hugging Face | Kannada-pretrained, fine-tunable for Tulu via transfer learning |
| Data collection | Custom recording protocol + consent forms | No existing Tulu speech dataset of usable size exists |
| Embeddings | Multilingual `sentence-transformers` | Kannada query → document matching |
| Vector store | ChromaDB / FAISS | Lightweight, appropriate for a mini-project corpus size |
| LLM | Open Hugging Face model or Gemini/OpenAI API, prompt-constrained | Answers only from retrieved context |
| TTS | AI4Bharat Indic-TTS / Coqui (Kannada) | Best available open Kannada synthesis |
| Backend | Node.js + Express | Orchestrates ASR → retrieval → LLM → TTS |
| Frontend | React + Tailwind, mobile-first | Large mic button, icon-driven, minimal text |
| Data storage | MongoDB Atlas | Scheme corpus metadata, anonymized query logs |

## 7. Data Collection Plan & Ethics

Since no Tulu dataset of usable size exists, collecting one is part of the deliverable, not a footnote:

- Recruit volunteer native Tulu speakers (family, ISDC network, local contacts)
- Prioritize scheme/agri/fisheries vocabulary and everyday phrases over open-domain speech, to keep scope realistic
- Obtain informed consent for recording and stated research/educational use
- Credit all contributing speakers explicitly in the project writeup
- Reach out to **Jai Tulunad** (Mangaluru) — they've already done comparable groundwork on the text side (FLORES-200 Tulu) and may be willing to advise or share contacts

## 8. Scope

### ✅ In scope for v1
- Small Tulu ASR fine-tune with **honestly reported** accuracy (including where it fails)
- Full Kannada pipeline (ASR → retrieval → LLM → TTS) as the reliable, working demo path
- Karnataka state-scheme + fisheries-scheme corpus (curated, ~30–50 documents)
- Mobile-first PWA interface

### ⏸️ Explicitly out of scope
- Production-grade Tulu ASR/TTS — v1 is a documented first attempt, not a finished system
- Tulu TTS (speech generation) — ASR (speech-to-text) is the v1 focus; TTS for Tulu is future work
- Live government portal integration
- Multi-turn conversation memory

### 🔭 Future work (major project)
- Expand the Tulu dataset with more speakers/hours
- Attempt Tulu TTS once ASR results justify it
- Formal collaboration with Jai Tulunad or a linguistics department
- IVR/phone-call access for users without smartphones

## 9. Known Risks & Honest Limitations

- A few hours of self-collected audio will **not** produce a robust ASR system — the deliverable is a credible first attempt with transparent error analysis, not a claim of solving Tulu ASR
- Retrieval quality determines answer correctness more than model choice — most engineering effort belongs there
- Dialectal variation within Tulu itself (regional differences across coastal Karnataka) may affect results
- The assistant must always disclose: *informational aid only, verify with official sources*

## 10. Build Phases

1. **Phase 1 — Kannada pipeline first**: Build and validate the full ASR → retrieval → LLM → TTS loop in Kannada, where all components are reliable. This is your working baseline and fallback demo.
2. **Phase 2 — Tulu data collection**: Record and transcribe the small Tulu corpus, in parallel with Phase 1.
3. **Phase 3 — Tulu fine-tuning**: Fine-tune IndicWav2Vec on the Tulu set, evaluate honestly (WER, failure modes).
4. **Phase 4 — Integration**: Plug the Tulu model into the same pipeline as an alternate ASR path.
5. **Phase 5 — Field test**: Test with real speakers — both Kannada and Tulu — and document actual usability, not just lab numbers.

## 11. Setup

```bash
git clone <repo-url>
cd tuluvaani

# Backend
cd server && npm install
npm run dev

# Frontend
cd ../client && npm install
npm run dev
```

Environment variables: `HF_API_KEY`, `LLM_API_KEY`, `MONGODB_URI` — see `.env.example`.

## 12. Acknowledgments

- **AI4Bharat** — IndicWav2Vec2 and Indic-TTS models
- **Jai Tulunad** — prior groundwork on Tulu-English text resources (FLORES-200), Mangaluru
- All volunteer Tulu speakers who contributed recordings for this project

## 13. License

MIT