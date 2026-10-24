#!/usr/bin/env python3
"""
asr_service.py
Lightweight FastAPI microservice running IndicWav2Vec / Fine-tuned Tulu ASR.
Exposes:
  GET  /health
  POST /transcribe (accepts multipart audio file, returns Kannada/Tulu text)
"""

import io
import os
import torch
import torchaudio
from fastapi import FastAPI, UploadFile, File, HTTPException
from transformers import AutoProcessor, AutoModelForCTC

MODEL_NAME = os.getenv("ASR_MODEL_NAME", "ai4bharat/indicwav2vec-kannada")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = FastAPI(title="TuluVaani ASR Service")

print(f"Loading ASR model '{MODEL_NAME}' onto device '{DEVICE}'...")
processor = AutoProcessor.from_pretrained(MODEL_NAME)
model = AutoModelForCTC.from_pretrained(MODEL_NAME).to(DEVICE)
model.eval()
print("ASR model successfully loaded.")

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "device": DEVICE}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        waveform, sample_rate = torchaudio.load(io.BytesIO(audio_bytes))

        # Convert to mono if multi-channel
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)

        # Resample to 16,000 Hz if necessary
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resampler(waveform)

        inputs = processor(waveform.squeeze().numpy(), sampling_rate=16000, return_tensors="pt", padding=True)
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

        with torch.no_grad():
            logits = model(**inputs).logits
            predicted_ids = torch.argmax(logits, dim=-1)
            transcription = processor.batch_decode(predicted_ids)[0]

        return {
            "success": True,
            "filename": file.filename,
            "transcript": transcription.strip()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
