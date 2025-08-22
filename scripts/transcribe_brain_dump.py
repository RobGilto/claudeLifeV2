#!/usr/bin/env python3
"""
WAV to Brain Dump Transcription Script

Transcribes WAV audio files to brain dump format in journal/brain folder and triggers analysis.

Usage:
    python scripts/transcribe_brain_dump.py <wav_file_path>

Dependencies:
    pip install openai-whisper
"""

import sys
import os
import whisper
import re
from pathlib import Path
from datetime import datetime


def extract_topic_from_text(text, max_words=3):
    """Extract a topic from transcribed text for filename"""
    words = re.findall(r'\b\w+\b', text.lower())
    if not words:
        return "audio-note"
    
    # Take first few meaningful words, skip common words
    skip_words = {'this', 'is', 'a', 'the', 'and', 'or', 'but', 'so', 'i', 'we', 'you'}
    meaningful_words = [w for w in words[:10] if w not in skip_words]
    
    topic_words = meaningful_words[:max_words] if meaningful_words else words[:max_words]
    return "-".join(topic_words)


def transcribe_wav_to_brain_dump(wav_path):
    """Transcribe WAV file to brain dump format"""
    
    if not os.path.exists(wav_path):
        print(f"Error: WAV file not found: {wav_path}")
        return None
    
    if not wav_path.lower().endswith('.wav'):
        print(f"Error: File must be a WAV file: {wav_path}")
        return None
    
    print(f"Loading Whisper model...")
    model = whisper.load_model("base")
    
    print(f"Transcribing: {wav_path}")
    result = model.transcribe(wav_path)
    
    # Extract topic from transcription
    topic = extract_topic_from_text(result['text'])
    
    # Create journal/brain directory if it doesn't exist
    brain_dir = Path("journal/brain")
    brain_dir.mkdir(parents=True, exist_ok=True)
    
    # Create output filename
    date_str = datetime.now().strftime("%Y-%m-%d")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    output_path = brain_dir / f"braindump-{topic}-{date_str}.md"
    
    # Generate brain dump markdown content
    wav_file = Path(wav_path)
    
    markdown_content = f"""---
date: {date_str}
type: braindump
tags: [audio-transcription]
status: draft
privacy: private
source: {wav_file.name}
transcribed: {timestamp}
---

# Brain Dump: {topic.replace('-', ' ').title()}

**Audio Source:** {wav_file.name}  
**Transcribed:** {timestamp}  
**Duration:** {result.get('duration', 'Unknown')} seconds

## Stream of Consciousness

{result['text'].strip()}

---

*Transcribed from audio using OpenAI Whisper*
"""
    
    # Write brain dump file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"Brain dump saved to: {output_path}")
    return output_path


def trigger_brain_dump_analysis(brain_dump_path):
    """Trigger brain dump analysis on the created file"""
    import subprocess
    
    print(f"Triggering brain dump analysis for: {brain_dump_path}")
    
    try:
        # Execute Claude Code brain dump analysis command
        result = subprocess.run([
            "claude-code", 
            "/brain-dump-analysis"
        ], capture_output=True, text=True, cwd="/home/robert/AIPortfolio/dev/claudeLifeV2")
        
        if result.returncode == 0:
            print("✅ Brain dump analysis completed successfully!")
            if result.stdout:
                print("Analysis output:")
                print(result.stdout)
        else:
            print("⚠️  Brain dump analysis encountered issues:")
            if result.stderr:
                print(result.stderr)
            print("You can manually run: /brain-dump-analysis")
            
    except FileNotFoundError:
        print("⚠️  Claude Code not found in PATH")
        print("Manually run: /brain-dump-analysis")
    except Exception as e:
        print(f"⚠️  Error triggering analysis: {e}")
        print("Manually run: /brain-dump-analysis")


def main():
    if len(sys.argv) != 2:
        print("Usage: python scripts/transcribe_brain_dump.py <wav_file_path>")
        sys.exit(1)
    
    wav_path = sys.argv[1]
    
    # Transcribe WAV to brain dump
    brain_dump_path = transcribe_wav_to_brain_dump(wav_path)
    
    if brain_dump_path:
        # Trigger brain dump analysis
        trigger_brain_dump_analysis(brain_dump_path)
        print("Brain dump transcription and analysis trigger completed successfully!")
    else:
        print("Brain dump transcription failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()