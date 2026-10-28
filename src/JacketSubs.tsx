import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

// Simple subtitles of the speaker's words for the 30s jacket cut (overlay only, transparent).
// Composited onto the untouched HDR footage by scripts/composite_hdr.py.
// Times are on the cut timeline; phrase starts come from silencedetect on the voice.
// Cut (composite_hdr.py segments): 0-17.4, 30.85-37.5, 40.9-46.65 (drops the 38.2-40.3s sentence).

loadFont({family: 'Cairo', url: staticFile('fonts/cairo-arabic-800-normal.woff2'), weight: '800'});

const SUBS: [number, number, string][] = [
  [0.45, 2.75, 'شوف معي هال jacket'],
  [2.91, 4.3, 'في منها لون الـ black'],
  [4.47, 5.7, 'والـ dark blue'],
  [6.31, 7.6, 'بتجي double zipper'],
  [7.83, 8.95, 'من فوق ومن تحت'],
  [8.95, 10.4, 'وفيك تسكّرها بالأزرار'],
  [10.83, 11.8, 'كتير مرتّبة'],
  [12.39, 14.0, 'وبالنسبة لهيدا الفرو'],
  [14.0, 15.0, 'removable'],
  [15.0, 16.95, 'فيك تفكّو إذا بدّك'],
  [17.65, 19.2, 'Okay، هيدي الكحلية'],
  [19.55, 20.9, 'كمان كتير حلوة'],
  [22.4, 23.6, 'نفس الشي'],
  [24.38, 26.5, 'Quality تبعيتها كتير حلوة'],
  [27.45, 29.6, 'لحّق حالك وحكينا'],
];

const Sub: React.FC<{from: number; to: number; text: string}> = ({from, to, text}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from * 30, from * 30 + 4, to * 30 - 4, to * 30], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 560, textAlign: 'center', opacity: p}}>
      <span
        dir="rtl"
        style={{
          fontFamily: 'Cairo, sans-serif',
          fontWeight: 800,
          fontSize: 66,
          lineHeight: 1.35,
          color: 'white',
          unicodeBidi: 'isolate',
          textShadow: '0 0 6px rgba(0,0,0,0.9), 0 3px 10px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,1)',
        }}
      >
        {text}
      </span>
    </div>
  );
};

// Small WhatsApp tag at the top for the last seconds (inside the Reels safe zone).
const WhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const start = 27.0 * 30;
  const p = interpolate(frame, [start, start + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 270, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * -16}px)`}}>
      <div style={{background: '#1fa855', borderRadius: 999, padding: '12px 38px 14px', fontFamily: 'Inter, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: 40, color: 'white', letterSpacing: 1, boxShadow: '0 12px 30px rgba(0,0,0,0.3)'}}>
        WhatsApp · 81 98 55 45
      </div>
    </div>
  );
};

export const JacketSubs: React.FC = () => (
  <AbsoluteFill>
    {SUBS.map(([from, to, text]) => (
      <Sub key={from} from={from} to={to} text={text} />
    ))}
    <WhatsApp />
  </AbsoluteFill>
);

export const jacketSubsDuration = 894; // 17.4 + 6.65 + 5.75 s
