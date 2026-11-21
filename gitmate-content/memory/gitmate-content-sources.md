---
name: gitmate-content-sources
description: How the git.mate owner sends content ideas (audio/video examples) and how to turn them into reels
metadata:
  type: feedback
  modified: 2026-10-24T09:35:38.175Z
---

- 2026-10-24: owner sent an mp3 (Hindi tech-news voiceover about AI finding the PHP2Shell bug). It was NOT background music: owner wants the audio's CONTENT turned into our own script, a new Marcus English voiceover, and visuals in our style. I first misread it as music and the owner corrected me.
- **Why:** owner shares example content from other creators as the topic/angle to cover; the visuals and voice must always be ours.
- **How to apply:** when the owner sends audio or video "content", transcribe it, verify the facts with a web search, and write a short mate-tone script (~35s). Then make the reel in the current theme (see [[dev-repo-page-style]]). Only treat an upload as music when the owner says so.
- Transcription without the ElevenLabs upload tools: `pip install faster-whisper`, then use WhisperModel('small', int8) on a numpy array decoded with ffmpeg to 16 kHz wav. Passing a file path fails because of an av version issue. word_timestamps=True gives word timings for the voiceover sync (free, ~1 min).
- Result: /mnt/project-files/dev-reels/php2shell/ (light theme, 38s).
- 2026-10-25 network notes (daily run): huggingface.co is blocked, so faster-whisper can't download its model. Working route: ElevenLabs creative_attach_reference_file with the generated voice's content_url on the same flow, then creative_transcribe_audio (eleven_scribe_v1) gives word timings. README videos on github.com/user-attachments / private-user-images are blocked, and github.githubassets.com is blocked, so github.com page screenshots come out unstyled. Use repo-hosted media via raw.githubusercontent.com (docs/ images, brand svgs) instead.
- Dark reel template with the new dark ending (mark + rings, handle types, Follow tap): /mnt/project-files/dev-reels/openshell/ (2026-10-25).
- 2026-10-27 daily run (microduck, dark): when README media is only on user-attachments (blocked), the project's official product site often hosts the same media (pollen-robotics.com/assets/...); alpha VP9 webm cutouts decode with `ffmpeg -c:v libvpx-vp9 -i x.webm` to RGBA png. Frame sequences in reel.html: swap img src per tick and have __seek return img.decode() promises. Newest dark template: /mnt/project-files/dev-reels/microduck/.
- 2026-10-28 daily run (thinkrail, light): newest LIGHT template /mnt/project-files/dev-reels/thinkrail/. Gotcha: never use class "f" on inner elements, it inherits the 1080x1920 frame style (.f). Set element text from tick(t), not gsap.set textContent. ElevenLabs voice sped with atempo 1.07, word timings from raw voice divided by 1.07.
