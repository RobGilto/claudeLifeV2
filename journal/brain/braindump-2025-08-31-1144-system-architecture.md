---
date: 2025-08-31
time: 11:44
type: braindump
source: audio
topic: system-architecture
tags: [bash-tools, morning-checkins, taskwarrior, reviews]
status: raw
privacy: private
audio_file: 20250831_114456.WAV
duration: Unknown
---

# Brain Dump: System Architecture

I think it's very important that for Claude Life version 3 we give the system enough bash tools to be able to use them instead of MCPs or to be able to use these bash tools to do very specific things and basically because my system is native to bash this will be really good for that. I'm thinking about a failover using Python but that means I'll have to containerize it if I want to ship it to different computers but for now I think bash is a way and also all these bash tools will be written and uploaded into GitHub where Claude can reference what he can do from there. 

I think for a protocol requirements perspective as a user I want to have morning check-ins where the slash command prompt asks me to answer a few questions and wait for me to answer them. Once I answered them the slash command will grab the information and organize them in a way that is useful. For example it will organize all my answers into the daily date.md. It will put all my answers in there. Then it will cross reference my answers to task warrior. It will determine based on task warrior pending tasks whether a task needs to be opened up a task is completed or a task is abandoned. 

As a user I want to be able to review how yesterday went preferably something that I'll do in the mornings. There won't be any interactivity in this. This review is going to be a slash command. The system will read task warrior. The system will read my daily date file for yesterday. Obviously the system will understand what's my current date. The system will read the system will read what was completed yesterday. It will come back to me saying yesterday you worked on such and such. You completed it. It will give me a summary of what I completed and what's pending in the task warrior. It will save the review file for yesterday under review daily folder which will say review date.md. Then it will give me a short summary about what I did yesterday and what challenges I faced.

---
*Transcribed from audio - 2025-08-31 11:44:56*