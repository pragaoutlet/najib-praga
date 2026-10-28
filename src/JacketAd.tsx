import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';

// Talking-to-camera jacket video (public/media/jacket.mp4, 47s): black version until ~29.5s,
// navy after. Keeps the speaker's voice, adds a quiet music bed and Arabic overlays.
// Text stays inside the Reels safe zone: clear of the top ~250px and bottom ~450px.

loadFont({family: 'Cairo', url: staticFile('fonts/cairo-arabic-700-normal.woff2'), weight: '700'});
loadFont({family: 'Cairo', url: staticFile('fonts/cairo-arabic-800-normal.woff2'), weight: '800'});

const AR = 'Cairo, sans-serif';
const EN = 'Inter, Helvetica, Arial, sans-serif';
const CREAM = '#f6f1ea';
const RED = '#E10600';
const PANEL = 'rgba(12,11,10,0.72)';
const ease = Easing.bezier(0.33, 0, 0.2, 1);

type Caption = {from: number; to: number; ar: string; en: string; swatch?: string};

// Times in seconds, matched to what is on screen.
const CAPTIONS: Caption[] = [
  {from: 3.4, to: 8.0, ar: 'اللون الأوّل: أسود', en: 'Colour 1 · Black', swatch: '#1b1b1d'},
  {from: 13.0, to: 17.0, ar: 'ياقة فرو دافية', en: 'Warm fur collar'},
  {from: 24.3, to: 27.3, ar: 'ومن ورا كمان 👌', en: 'Clean from the back too'},
  {from: 30.0, to: 34.5, ar: 'اللون التاني: كحلي', en: 'Colour 2 · Navy', swatch: '#1f2c5a'},
  {from: 38.0, to: 42.5, ar: 'أي لون أحلى عليك؟ 🤔', en: 'Which colour is yours?'},
];

const fadeWindow = (frame: number, from: number, to: number, fade = 10) =>
  interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

const Label: React.FC<{c: Caption}> = ({c}) => {
  const frame = useCurrentFrame();
  const p = fadeWindow(frame, c.from * 30, c.to * 30);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 520, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{background: PANEL, borderRadius: 22, padding: '18px 40px 20px', textAlign: 'center', maxWidth: 900}}>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 64, color: CREAM, lineHeight: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22}}>
          {c.swatch && <span style={{width: 38, height: 38, borderRadius: '50%', background: c.swatch, border: '3px solid rgba(246,241,234,0.85)', display: 'inline-block'}} />}
          {c.ar}
        </div>
        <div style={{fontFamily: EN, fontWeight: 400, fontSize: 30, letterSpacing: 2, color: 'rgba(246,241,234,0.75)', marginTop: 4}}>{c.en}</div>
      </div>
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const p = fadeWindow(frame, 0, 3.2 * 30, 8);
  const line = interpolate(frame, [6, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: p, transform: `scale(${0.96 + 0.04 * p})`}}>
      <div style={{background: PANEL, borderRadius: 26, padding: '26px 46px 28px', textAlign: 'center', maxWidth: 960}}>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 76, color: CREAM, lineHeight: 1.25}}>
          جاكيت واحد… لونين
          <br />
          شو بتختار؟ 👀
        </div>
        <div style={{height: 4, width: 220 * line, background: RED, margin: '18px auto 14px'}} />
        <div style={{fontFamily: EN, fontSize: 30, letterSpacing: 3, color: 'rgba(246,241,234,0.75)'}}>ONE JACKET · TWO COLOURS</div>
      </div>
    </div>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 43.6 * 30;
  const a = interpolate(frame, [start, start + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const b = interpolate(frame, [start + 10, start + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{background: `rgba(12,11,10,${0.5 * a})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 24}px)`, marginTop: -120}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 26, marginBottom: 22}}>
          {['#1b1b1d', '#1f2c5a'].map((c) => (
            <span key={c} style={{width: 70, height: 70, borderRadius: '50%', background: c, border: '4px solid rgba(246,241,234,0.9)'}} />
          ))}
        </div>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 96, color: CREAM, lineHeight: 1.3}}>اختار لونك</div>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 48, color: CREAM}}>أسود · كحلي</div>
      </div>
      <div style={{position: 'absolute', bottom: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: b, transform: `translateY(${(1 - b) * 24}px)`}}>
        <div style={{background: '#1fa855', borderRadius: 999, padding: '20px 56px 24px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)'}}>
          <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 60, color: 'white'}}>بعتلنا مقاسك عالواتساب 👇</div>
          <div style={{fontFamily: EN, fontWeight: 600, fontSize: 36, color: 'white', letterSpacing: 2}}>81 98 55 45</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const jacketAdDuration = 1410;

export const JacketAd: React.FC = () => (
  <AbsoluteFill style={{background: 'black'}}>
    {/* Voice kept from the clip (cleaned + loudness-normalised when converting). */}
    <OffthreadVideo src={staticFile('media/jacket.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    {/* Quiet bed under the voice. Generated by: python3 scripts/make_soft_soundtrack.py 1410 public/audio/jacket-bed.wav */}
    <Audio src={staticFile('audio/jacket-bed.wav')} volume={0.12} />
    <Hook />
    {CAPTIONS.map((c) => (
      <Label key={c.from} c={c} />
    ))}
    <EndCard />
  </AbsoluteFill>
);
