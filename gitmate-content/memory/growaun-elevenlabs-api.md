---
name: growaun-elevenlabs-api
description: 2026-11-11 owner's NEW ElevenLabs account for all reel voiceovers; use the REST API directly (key not stored), with-timestamps gives word timings
metadata:
  type: project
---

2026-11-11 the old ElevenLabs account (connector) had 0 credits. Owner gave the API key of a NEW ElevenLabs account (message in the "git.mate daily reel" thread, 2026-11-11 13:25 UTC) and said: same voice, use this account from now on. **Never write the key into memory or files.** It is not in the cloud env yet; ask the owner to add it as env var (e.g. ELEVENLABS_API_KEY) in the project's cloud environment so routines can use it, otherwise a run must get it from that thread message.

**Key permissions:** TTS only (user_read / voices_read are refused). The ElevenLabs connector still points to the OLD empty account.
**How (reel #75):** POST https://api.elevenlabs.io/v1/text-to-speech/lOJWQNMBIzoU3N0EnOya/with-timestamps?output_format=mp3_44100_192 with header xi-api-key, body {"text": script, "model_id": "eleven_v4"} (audio tags like [serious] work). Response: audio_base64 + alignment (characters, character_start_times_seconds). Word times = find each tagless script word in the joined characters string sequentially, take its first char start; divide by the atempo factor -> vo/words_<name>.json. No transcription step needed. 135-word script = 51 s raw.
Related: [[growaun-reel-pipeline]], [[growaun-gemini-tts]].
