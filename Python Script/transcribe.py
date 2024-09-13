import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

import whisper
import tkinter as tk
from tkinter import filedialog
import os
import numpy as np

def select_audio_file():
    root = tk.Tk()
    root.withdraw()
    audio_file_path = filedialog.askopenfilename(
        title="Select audio file",
        filetypes=[("Audio Files", "*.mp3;*.wav"), ("All Files", "*.*")]
    )
    return audio_file_path

def format_timestamp(seconds):
    minutes = int(seconds // 60)
    secs = int(seconds % 60)
    millisecs = int((seconds % 1) * 1000)
    return f"{minutes:02d}:{secs:02d}.{millisecs:03d}"

def transcribe_music_with_precise_timing(file_path):
    model = whisper.load_model("medium")  # Use "medium" model for better accuracy
    print(f"Transcribing file: {file_path}")
    
    result = model.transcribe(file_path, verbose=True, word_timestamps=True)

    timed_transcriptions = []
    current_line = ""
    line_start = None
    last_end = 0

    for segment in result["segments"]:
        for word in segment["words"]:
            if line_start is None:
                line_start = word["start"]
            
            current_line += word["word"] + " "
            
            if (word["end"] - word["start"] > 0.5) or len(current_line) > 50:
                if current_line.strip():
                    timed_transcriptions.append(f"[{format_timestamp(line_start)} --> {format_timestamp(word['end'])}] {current_line.strip()}")
                current_line = ""
                line_start = None
                last_end = word["end"]

    if current_line.strip():
        timed_transcriptions.append(f"[{format_timestamp(line_start)} --> {format_timestamp(last_end)}] {current_line.strip()}")

    # Remove duplicate lines
    timed_transcriptions = list(dict.fromkeys(timed_transcriptions))

    return "\n".join(timed_transcriptions)

def main():
    audio_file = select_audio_file()
    
    if not audio_file or not os.path.exists(audio_file):
        print("No valid file selected.")
        return

    # Perform transcription with precise timing
    transcription = transcribe_music_with_precise_timing(audio_file)
    
    output_path = os.path.splitext(audio_file)[0] + "_precise_lyrics_transcription.txt"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(transcription)
    
    print(f"Precise lyrics transcription saved to: {output_path}")

if __name__ == "__main__":
    main()
