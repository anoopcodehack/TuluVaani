#!/usr/bin/env python3
"""
evaluate_wer.py
Evaluates ASR transcriptions against ground truth using:
- Word Error Rate (WER)
- Character Error Rate (CER)
Provides transparent error breakdown as specified in project goals.
"""

import argparse
import pandas as pd
import jiwer

def evaluate(ref_csv: str, hyp_csv: str):
    ref_df = pd.read_csv(ref_csv)
    hyp_df = pd.read_csv(hyp_csv)

    merged = pd.merge(ref_df, hyp_df, on="audio_path", suffixes=("_ref", "_hyp"))

    refs = merged["transcript_ref"].fillna("").tolist()
    hyps = merged["transcript_hyp"].fillna("").tolist()

    wer_score = jiwer.wer(refs, hyps)
    cer_score = jiwer.cer(refs, hyps)

    print("\n========== ASR EVALUATION METRICS ==========")
    print(f"Total Samples Evaluated: {len(merged)}")
    print(f"Word Error Rate (WER):     {wer_score * 100:.2f}%")
    print(f"Character Error Rate (CER):{cer_score * 100:.2f}%")
    print("============================================\n")

    print("Sample Comparisons (First 5):")
    for i in range(min(5, len(merged))):
        print(f"[{i+1}] Audio: {merged.iloc[i]['audio_path']}")
        print(f"    Target:     {merged.iloc[i]['transcript_ref']}")
        print(f"    Predicted:  {merged.iloc[i]['transcript_hyp']}")
        print("-" * 40)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate ASR WER/CER")
    parser.add_argument("--ref", type=str, required=True, help="Ground truth CSV with audio_path & transcript")
    parser.add_argument("--hyp", type=str, required=True, help="Predictions CSV with audio_path & transcript")
    args = parser.parse_args()
    evaluate(args.ref, args.hyp)
