import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';

// Arabic (Lebanese) hooks over the gilet mirror video (public/media/gilet.mp4, 22.6s).
// Text stays inside the Reels safe zone: clear of the top ~250px and bottom ~450px.

loadFont({family: 'Cairo', url: staticFile('fonts/cairo-arabic-700-normal.woff2'), weight: '700'});
loadFont({family: 'Cairo', url: staticFile('fonts/cairo-arabic-800-normal.woff2'), weight: '800'});

const AR = 'Cairo, sans-serif';
const EN = 'Inter, Helvetica, Arial, sans-serif';
const CREAM = '#f6f1ea';
const RED = '#E10600';
const PANEL = 'rgba(12,11,10,0.72)';
const ease = Easing.bezier(0.33, 0, 0.2, 1);

export type GiletAdProps = {cta: 'whatsapp' | 'web'};

type Caption = {from: number; to: number; ar: string; en: string; place: 'top' | 'low'};

// Times in seconds, matched to what is on screen in the footage.
const CAPTIONS: Caption[] = [
  {from: 2.8, to: 5.0, ar: 'جيليه مبطّن ودافي', en: 'Quilted Gilet', place: 'low'},
  {from: 5.2, to: 9.4, ar: 'متوفّر بلونين: أسود و Taupe', en: 'Black & Taupe', place: 'low'},
  {from: 9.6, to: 11.8, ar: 'خط مميّز عالصدر', en: 'Signature chest stripe', place: 'low'},
  {from: 12.0, to: 14.8, ar: 'ياقة عالية بخط ناعم', en: 'Stand collar with stripe trim', place: 'low'},
  {from: 15.0, to: 18.2, ar: 'تفاصيل نضيفة من جوّا', en: 'Clean details inside', place: 'low'},
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
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 64, color: CREAM, lineHeight: 1.3}}>{c.ar}</div>
        <div style={{fontFamily: EN, fontWeight: 400, fontSize: 30, letterSpacing: 2, color: 'rgba(246,241,234,0.75)', marginTop: 4}}>{c.en}</div>
      </div>
    </div>
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const p = fadeWindow(frame, 0, 2.7 * 30, 8);
  const line = interpolate(frame, [6, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <div style={{position: 'absolute', top: 260, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: p, transform: `scale(${0.96 + 0.04 * p})`}}>
      <div style={{background: PANEL, borderRadius: 26, padding: '26px 46px 28px', textAlign: 'center', maxWidth: 960}}>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 76, color: CREAM, lineHeight: 1.25}}>
          الجيليه يلّي كل شب
          <br />
          بدّو ياه هالشتوية ❄️
        </div>
        <div style={{height: 4, width: 220 * line, background: RED, margin: '18px auto 14px'}} />
        <div style={{fontFamily: EN, fontSize: 30, letterSpacing: 3, color: 'rgba(246,241,234,0.75)'}}>THE GILET EVERY MAN NEEDS THIS WINTER</div>
      </div>
    </div>
  );
};

const EndCard: React.FC<{cta: GiletAdProps['cta']}> = ({cta}) => {
  const frame = useCurrentFrame();
  const start = 20.3 * 30;
  const a = interpolate(frame, [start, start + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const b = interpolate(frame, [start + 10, start + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{background: `rgba(12,11,10,${0.55 * a})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 24}px)`, marginTop: -120}}>
        <div style={{fontFamily: EN, fontWeight: 300, fontSize: 34, letterSpacing: 12, color: 'rgba(246,241,234,0.8)'}}>QUILTED GILET</div>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 110, color: CREAM, lineHeight: 1.3}}>كمية محدودة</div>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 52, color: CREAM}}>قياسات من M لـ XXXL</div>
      </div>
      <div style={{position: 'absolute', bottom: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: b, transform: `translateY(${(1 - b) * 24}px)`}}>
        <div style={{background: cta === 'whatsapp' ? '#1fa855' : RED, borderRadius: 999, padding: '20px 56px 24px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.35)'}}>
          {cta === 'whatsapp' ? (
            <>
              <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 60, color: 'white'}}>بعتلنا مقاسك عالواتساب 👇</div>
              <div style={{fontFamily: EN, fontWeight: 600, fontSize: 36, color: 'white', letterSpacing: 2}}>81 98 55 45</div>
            </>
          ) : (
            <>
              <div dir="rtl" style={{fontFamily: AR, fontWeight: 800, fontSize: 60, color: 'white'}}>اطلب هلّق 👇</div>
              <div style={{fontFamily: EN, fontWeight: 600, fontSize: 40, color: 'white', letterSpacing: 2}}>pragaoutlet.com</div>
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const giletAdDuration = 679;

export const GiletAd: React.FC<GiletAdProps> = ({cta}) => (
  <AbsoluteFill style={{background: 'black'}}>
    <OffthreadVideo src={staticFile('media/gilet.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    {/* Generated by: python3 scripts/make_soft_soundtrack.py 679 public/audio/gilet.wav */}
    <Audio src={staticFile('audio/gilet.wav')} />
    <Hook />
    {CAPTIONS.map((c) => (
      <Label key={c.from} c={c} />
    ))}
    <EndCard cta={cta} />
  </AbsoluteFill>
);
