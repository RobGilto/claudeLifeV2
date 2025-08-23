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
    
    # Create journal/brain and analysis directories if they don't exist
    brain_dir = Path("journal/brain")
    brain_dir.mkdir(parents=True, exist_ok=True)
    (brain_dir / "analysis").mkdir(exist_ok=True)
    
    # Create output filename with standardized timestamp format
    date_str = datetime.now().strftime("%Y-%m-%d")
    time_str = datetime.now().strftime("%H:%M")
    timestamp_for_filename = datetime.now().strftime("%Y-%m-%d-%H%M")
    full_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    output_path = brain_dir / f"braindump-{timestamp_for_filename}-{topic}.md"
    
    # Generate brain dump markdown content with standardized format
    wav_file = Path(wav_path)
    duration_seconds = int(result.get('duration', 0))
    
    markdown_content = f"""---
date: {date_str}
time: {time_str}
type: braindump
source: audio
topic: {topic}
tags: []
status: raw
privacy: private
audio_file: {wav_file.name}
duration: {duration_seconds}
---

# Brain Dump: {topic.replace('-', ' ').title()}

{result['text'].strip()}

---
*Transcribed from audio - {full_timestamp}*
"""
    
    # Write brain dump file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"Brain dump saved to: {output_path}")
    return output_path


def trigger_brain_dump_analysis(brain_dump_path):
    """Trigger brain dump analysis on the created file"""
    import subprocess
    from pathlib import Path
    
    print(f"Triggering brain dump analysis for: {brain_dump_path}")
    
    # Create analysis filename
    filename = Path(brain_dump_path).name
    topic_and_timestamp = filename.replace('braindump-', '').replace('.md', '')
    analysis_path = Path("journal/brain/analysis") / f"analysis-{topic_and_timestamp}.md"
    
    try:
        # Get current working directory for Claude Code
        current_dir = os.getcwd()
        
        # Create analysis prompt for Claude Code
        analysis_prompt = f"""Please analyze the brain dump file at {brain_dump_path} and create a comprehensive analysis following this format:

---
date: {datetime.now().strftime('%Y-%m-%d')}
time: {datetime.now().strftime('%H:%M')}
type: analysis
source: brain-dump-analysis
related: {filename}
tags: []
status: final
privacy: private
---

# Brain Dump Analysis: [Topic from original]

## Key Insights Extracted
[Extract main themes and insights]

## Patterns and Connections
[Identify patterns, connections to previous brain dumps/learning]

## Actionable Items
[Concrete next steps and actions]

## Strategic Implications
[How this connects to career goals, learning path, etc.]

## Questions for Further Exploration
[Areas that need more thought or research]

## Connections to Existing Projects
[How this relates to RuneQuest, AI engineering goals, etc.]

Save this analysis to: {analysis_path}"""
        
        print(f"📊 Analysis will be saved to: {analysis_path}")
        print("⚠️  Please manually run brain dump analysis in Claude Code")
        print(f"Analysis path: {analysis_path}")
        
    except Exception as e:
        print(f"⚠️  Error setting up analysis: {e}")
        print("Manually run brain dump analysis in Claude Code")


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