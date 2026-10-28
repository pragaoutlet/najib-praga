# Praga video editing: house style

Praga is a designer-fashion outlet in Beirut (pragaoutlet.com, WhatsApp 81 98 55 45).
Videos are edited with Remotion in this repo. The approved reference edit is the
jacket video: `src/JacketSubs.tsx` + `scripts/composite_hdr.py` (output `out/JacketSubs-HDR.mp4`).
Edit every new video like that one: simple, classy, well edited.

## Always
- **Never change the footage colours.** No filters, grading, tone-mapping or colour-matrix
  conversion. iPhone clips are HDR (HEVC 10-bit, BT.2020/HLG): render text as a transparent
  overlay (ProRes 4444, alpha) and composite it onto the untouched original with
  `scripts/composite_hdr.py`, which keeps the video HDR as shot. Verify by comparing a frame
  without text against the original (difference should be ~0).
- **Subtitles of what the speaker says**, nothing else written on screen:
  - Arabic script (Lebanese spelling), English words kept in English
    (e.g. «شوف معي هال jacket», «Quality تبعيتها كتير حلوة»). The user types the words in
    Arabizi; convert them and show the Arabic for approval before rendering.
  - One short line at a time, timed to the voice using pauses from ffmpeg `silencedetect`.
  - Cairo ExtraBold (`public/fonts/cairo-arabic-800-normal.woff2`), white, soft dark shadow,
    no boxes, no emojis, lower middle of the frame (bottom ≈560px, inside the Reels safe zone).
  - `dir="rtl"` with `unicode-bidi: isolate` so lines starting with an English word still read
    right-to-left.
- **No brand names and no prices** in on-screen text, even if spoken (e.g. hide "Emporio Armani").
- Keep the speaker's **voice** (cleaned: highpass, light denoise, loudnorm) with a **quiet music
  bed** underneath (`scripts/make_soft_soundtrack.py <frames> <out.wav>`, volume 0.12).
- Only CTA: a small green **"WhatsApp · 81 98 55 45"** tag at the top in the last ~3 seconds.
- **Cuts only inside pauses**, never mid-sentence, joined with a short 8-frame crossfade.
  Ask before removing anything the user didn't ask to remove; ~30s is the target length.
- Vertical 1080×1920, 30 fps.

## Never
- Stickers, flashes, screen shakes, falling cards, busy motion graphics (rejected as "معجوق").
- Big hooks/labels written by us instead of the user's words (replaced by subtitles).

## Delivery
- Send the final **HDR file as a download** (`display: attach`); it is what gets uploaded to Meta.
- If a preview is needed, also send a light 720p H.264 copy, labelled as preview only.
