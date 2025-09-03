# Command Systems Documentation

## Smart Command Recommender Protocol
The `/recommend` command provides intelligent, context-aware suggestions for the most appropriate slash commands based on:

- **Time-Based Intelligence**: Recommendations optimized for current Sydney time and day of week
- **Strategic Period Detection**: Automatic detection of month-end, quarter-end, and year-end planning periods
- **Mission Alignment**: All suggestions maintain coherence with AI engineering transformation goals
- **Values Integration**: Incorporates foundation commands (`/define-values`, `/define-roles`, `/lifestyle-vision`) when appropriate
- **Context Analysis**: Analyzes conversation topics and recent activity patterns for relevance
- **ADD Optimization**: Prioritizes commands that support executive function and sustainable productivity

**Year-End Strategic Focus (December 15-31)**: Automatically prioritizes strategic foundation commands like `/review-year`, `/plan-year`, `/lifestyle-vision`, and values/roles definition for comprehensive annual planning.

**Smart Detection Logic**: 
- Tracks missing daily activities (checkins, planning, skill updates)
- Analyzes recent journal entries and planning data for context
- Identifies gaps in ritual execution, victory tracking, and skill development
- Provides keyword-triggered suggestions based on conversation content
- Maintains strategic coherence across daily → weekly → monthly → quarterly → yearly planning levels

## Daily Check-In Protocols (Multiple Sessions)
The daily check-in system provides multiple touchpoints throughout the day for better ADD-friendly workflow:

### `/morning-checkin` or `/daily-checkin` Command
Early-day energy assessment and intention-setting:
- Wake time and morning energy level tracking
- Sleep quality assessment
- Physical state check-in
- Daily intentions and top 3 priorities
- Potential challenge identification
- One commitment declaration
- Silent victory detection from intentions

### `/evening-checkin` Command
Evening energy and planning checkpoint:
- Evening energy assessment and progress check
- Evening priority setting (focus areas for remaining day)
- Evening wins celebration and momentum tracking
- Focus/energy challenge identification
- Quick encouragement without full analysis

### `/end-of-day-checkout` Command  
End-of-day reflection and tomorrow planning with optional day plan integration:
- Overall day feeling and accomplishment review
- Challenge and blocker identification
- Gratitude and reflection prompts
- Tomorrow's priority setting
- **Smart Day Plan Integration**: Automatically detects if you have a day plan and offers performance review
- **Unified Analysis**: Combines subjective reflection with objective performance metrics
- **Victory Detection**: Enhanced victory detection from both reflection AND day plan completion
- Silent victory detection from accomplishments and gratitude

### File Management
- All commands append to same `journal/daily/daily-YYYY-MM-DD.md` file
- Metadata tracks which sessions completed: `sessions: [morning, afternoon, evening]`
- Analysis runs after evening checkin with combined data
- Victory detection runs after each session for comprehensive tracking

Daily entries are saved in journal/daily/ for long-term pattern recognition.

## Weekly Check-In Protocol
The `/weekly-checkin` command will:
1. Analyze project context to determine relevant metrics
2. Ask for current values of those specific metrics
3. Compare to previous data and generate visual analysis
4. Save formatted report with insights and recommendations

The system intelligently adapts to track what matters for this specific project.

## Brain Dump Protocol
The `/brain-dump` command provides:
- Streamlined creation of standardized brain dump files
- Automatic topic detection from content
- Consistent formatting for both text and transcribed content
- Files saved to `journal/brain/` with timestamp-based naming
- Automatic analysis generation in `journal/brain/analysis/`

### Brain Dump Format
```yaml
---
date: YYYY-MM-DD
time: HH:MM
type: braindump
source: text|audio
topic: auto-detected-topic
tags: []
status: raw
privacy: private
audio_file: filename.wav    # Only for transcribed
duration: 120              # Only for transcribed
---

# Brain Dump: Topic Title

[Stream of consciousness content]

---
*Direct text entry - YYYY-MM-DD HH:MM:SS*
```

## Brain Dump Analysis Protocol
The `/brain-dump-analysis` command will:
- Extract insights and patterns from stream-of-consciousness writing
- Show connections between ideas and track thinking evolution
- Generate structured analysis with actionable takeaways
- Save analysis to `journal/brain/analysis/` with matching timestamp
- Link back to original brain dump for reference

## Content and Analysis Commands

### Newsletter Research Protocol
The `/newsletter-research` command will:
- Analyze competitor newsletters for trending topics
- Identify content gaps and opportunities
- Generate ready-to-send newsletter drafts
- Match your writing voice based on existing content
- Save research and drafts to organized folders

### Daily Brief Protocol
The `/daily-brief` command provides:
- Personalized news briefing based on your interests (NSW Australia focus)
- Job market insights integrated from recent analysis
- Skills development recommendations based on market demand
- Progress tracking toward 2026 AI engineering goals
- Actionable next steps prioritized by impact
- Integration with skill matrix and gap analysis data

### Transcription Protocol
Audio transcription support for brain dumps and voice notes.

#### `/transcribe-brain-dump` Command
- Converts audio files to text brain dumps
- Supports .wav, .mp3, .m4a formats
- Automatic topic detection from transcribed content
- Maintains audio metadata (duration, file reference)
- Saves to `journal/brain/` with transcription markers

### Newsletter Management Protocol
The newsletter system provides tools for content creation, competitor analysis, and audience engagement.

#### `/newsletter-research` Command
- Analyzes competitor newsletters for trending topics
- Identifies content gaps and opportunities
- Generates ready-to-send newsletter drafts
- Matches your writing voice based on existing content
- Saves research and drafts to `research/newsletters/`

#### `/add-newsletter` Command
- Interactive newsletter creation with guided prompts
- Template selection and customization
- Audience targeting and segmentation
- Content scheduling and tracking
- Outputs to `newsletters/drafts/`