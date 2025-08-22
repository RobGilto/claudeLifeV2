# Transcribe Brain Dump

Transcribes a WAV audio file and saves it as a brain dump in the journal folder, then initiates brain dump analysis.

## Usage
```
/transcribe-brain-dump <wav_file_path>
```

## Implementation
1. Transcribe the WAV file using Whisper
2. Extract a topic from the transcription (first few words or timestamp)
3. Save transcription in brain dump format to `journal/brain/` folder
4. Automatically trigger brain dump analysis on the created file

## File Format
- Filename: `braindump-[topic]-YYYY-MM-DD.md`
- Location: `journal/brain/`
- YAML frontmatter with type: braindump
- Transcribed content in markdown format

## Dependencies
- OpenAI Whisper (already installed)
- Brain dump analysis system