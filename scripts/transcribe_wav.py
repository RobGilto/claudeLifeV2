#!/usr/bin/env python3
"""
WAV to Markdown Transcription Script

Transcribes WAV audio files to text using OpenAI Whisper and outputs as markdown files.

Usage:
    python scripts/transcribe_wav.py <wav_file_path>

Dependencies:
    pip install openai-whisper
"""

import sys
import os
import whisper
from pathlib import Path
from datetime import datetime


def transcribe_wav_to_md(wav_path):
    """Transcribe WAV file to markdown format"""
    
    if not os.path.exists(wav_path):
        print(f"Error: WAV file not found: {wav_path}")
        return False
    
    if not wav_path.lower().endswith('.wav'):
        print(f"Error: File must be a WAV file: {wav_path}")
        return False
    
    print(f"Loading Whisper model...")
    model = whisper.load_model("base")
    
    print(f"Transcribing: {wav_path}")
    result = model.transcribe(wav_path)
    
    # Create output filename
    wav_file = Path(wav_path)
    output_path = wav_file.parent / f"{wav_file.stem}-transcription.md"
    
    # Generate markdown content
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    markdown_content = f"""---
date: {datetime.now().strftime("%Y-%m-%d")}
type: transcription
source: {wav_file.name}
transcribed: {timestamp}
status: final
privacy: private
---

# Audio Transcription: {wav_file.stem}

**Source File:** {wav_file.name}  
**Transcribed:** {timestamp}  
**Duration:** {result.get('duration', 'Unknown')} seconds

## Transcript

{result['text'].strip()}

---

*Transcribed using OpenAI Whisper*
"""
    
    # Write markdown file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"Transcription saved to: {output_path}")
    return True


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/transcribe_wav.py <wav_file_path>")
        sys.exit(1)
    
    wav_path = sys.argv[1]
    
    if transcribe_wav_to_md(wav_path):
        print("Transcription completed successfully!")
    else:
        print("Transcription failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()