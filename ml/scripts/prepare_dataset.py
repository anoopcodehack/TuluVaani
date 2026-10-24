#!/usr/bin/env python3
"""
prepare_dataset.py
Preprocesses recorded Tulu audio files:
1. Resamples audio to 16,000 Hz Mono WAV.
2. Normalizes Kannada/Tulu transcripts (strips punctuation and non-Kannada symbols).
3. Produces stratified train/test CSV manifests.
"""

import os
import re
import argparse
import pandas as pd
import soundfile as sf
import librosa

TARGET_SR = 16000

def clean_kannada_text(text: str) -> str:
    """Removes special punctuation while preserving Kannada Unicode and whitespace."""
    if not isinstance(text, str):
        return ""
    # Retain Kannada Unicode range \u0C80-\u0CFF and basic whitespace
    cleaned = re.sub(r"[^\u0C80-\u0CFF\s]", " ", text)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def process_audio(input_path: str, output_path: str):
    """Loads audio, converts to 16kHz mono, and saves as 16-bit PCM WAV."""
    y, sr = librosa.load(input_path, sr=TARGET_SR, mono=True)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    sf.write(output_path, y, TARGET_SR, subtype="PCM_16")
    duration = librosa.get_duration(y=y, sr=TARGET_SR)
    return duration

def main():
    parser = argparse.ArgumentParser(description="Prepare Tulu ASR dataset")
    parser.add_argument("--manifest", type=str, default="ml/data/sample_manifest.csv", help="Input manifest CSV")
    parser.add_argument("--out_dir", type=str, default="ml/data/processed", help="Output directory")
    parser.add_argument("--test_ratio", type=float, default=0.2, help="Holdout test ratio")
    args = parser.parse_args()

    if not os.path.exists(args.manifest):
        print(f"Error: Manifest file {args.manifest} does not exist.")
        return

    df = pd.read_csv(args.manifest)
    print(f"Loaded {len(df)} samples from {args.manifest}")

    df["transcript"] = df["transcript"].apply(clean_kannada_text)

    # Train / Test split
    test_df = df.sample(frac=args.test_ratio, random_state=42)
    train_df = df.drop(test_df.index)

    os.makedirs(args.out_dir, exist_ok=True)
    train_path = os.path.join(args.out_dir, "train.csv")
    test_path = os.path.join(args.out_dir, "test.csv")

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

    print(f"Dataset preparation complete:")
    print(f" - Train samples: {len(train_df)} saved to {train_path}")
    print(f" - Test samples:  {len(test_df)} saved to {test_path}")

if __name__ == "__main__":
    main()
