import {loadFont} from '@remotion/fonts';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';

// Calm, editorial cut of the pragaoutlet.com screen recording: slow camera moves,
// crossfades, serif type, lots of space. Soundtrack: scripts/make_soft_soundtrack.py.

loadFont({family: 'Playfair Display', url: staticFile('fonts/playfair-display-latin-400-normal.woff2'), weight: '400'});
loadFont({family: 'Playfair Display', url: staticFile('fonts/playfair-display-latin-400-italic.woff2'), weight: '400', style: 'italic'});

const BG = '#0c0b0a';
const CREAM = '#f3eee6';
const MUTED = 'rgba(243,238,230,0.6)';
const RED = '#E10600';
const SERIF = '"Playfair Display", serif';
const SANS = 'Inter, Helvetica, Arial, sans-serif';
const SITE = staticFile('media/site.mp4');
const SITE_ASPECT = 2170 / 1080;
const ease = Easing.bezier(0.33, 0, 0.2, 1);

// Fade + small rise, starting at `delay` frames.
const useReveal = (delay: number, dur = 24) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return {opacity: p, transform: `translateY(${(1 - p) * 24}px)`};
};

// Slow continuous drift from a to b over the scene.
const useDrift = (a: number, b: number, dur: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, dur], [a, b], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});
};

const Logo: React.FC<{width: number; style?: React.CSSProperties}> = ({width, style}) => (
  // The PNG has wide transparent padding; crop to the wordmark + tagline.
  <div style={{width, height: width * 0.36, overflow: 'hidden', ...style}}>
    <Img src={staticFile('logo.png')} style={{width, marginTop: -width * 0.4}} />
  </div>
);

const Caption: React.FC<{title: string; sub?: string; delay?: number; style?: React.CSSProperties}> = ({title, sub, delay = 18, style}) => {
  const a = useReveal(delay);
  const b = useReveal(delay + 10);
  return (
    <div style={{width: '100%', textAlign: 'center', color: CREAM, ...style}}>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 84, lineHeight: 1.15, ...a}}>{title}</div>
      {sub && <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 30, letterSpacing: 12, marginTop: 26, color: MUTED, ...b}}>{sub}</div>}
    </div>
  );
};

const Opening: React.FC = () => {
  const r = useReveal(8, 36);
  const line = useReveal(30, 30);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center'}}>
      <Logo width={860} style={r} />
      <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 28, letterSpacing: 14, color: MUTED, marginTop: 40, opacity: line.opacity}}>BEIRUT · ONLINE</div>
    </AbsoluteFill>
  );
};

const Hero: React.FC = () => {
  // Frame only the hero image: skip the site header (top ~140px) and the chat widget at the bottom.
  const zoom = useDrift(1.22, 1.14, 110);
  return (
    <AbsoluteFill style={{background: BG}}>
      <AbsoluteFill style={{transformOrigin: '50% 0%', transform: `scale(${zoom}) translateY(-140px)`}}>
        <OffthreadVideo src={SITE} muted playbackRate={0.5} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(to bottom, transparent 70%, ${BG})`}} />
    </AbsoluteFill>
  );
};

const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useReveal(0, 30);
  const float = Math.sin(frame / 40) * 8;
  const w = 540;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, #2a2420, ${BG} 65%)`}}>
      <div style={{position: 'absolute', top: 170, width: '100%', display: 'flex', justifyContent: 'center', ...enter}}>
        <div style={{width: w, height: w * SITE_ASPECT, borderRadius: 64, border: '12px solid #181716', overflow: 'hidden', boxShadow: '0 50px 100px rgba(0,0,0,0.55)', transform: `translateY(${float}px)`}}>
          <OffthreadVideo src={SITE} muted trimBefore={60} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
        </div>
      </div>
      <Caption title="Designer fashion" sub="FOR MEN & WOMEN" delay={30} style={{position: 'absolute', top: 1450}} />
    </AbsoluteFill>
  );
};

const PRODUCTS = ['p1.png', 'p3.png', 'p5.png', 'p7.png', 'p6.png'];
const HOLD = 50;
const XFADE = 16;
const Products: React.FC = () => {
  const frame = useCurrentFrame();
  const title = useReveal(0, 30);
  return (
    <AbsoluteFill style={{background: BG}}>
      <div style={{position: 'absolute', top: 190, width: '100%', textAlign: 'center', ...title}}>
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 30, letterSpacing: 14, color: MUTED}}>THE EDIT</div>
        <div style={{fontFamily: SERIF, fontSize: 92, color: CREAM, marginTop: 10}}>New Arrivals</div>
      </div>
      {PRODUCTS.map((p, i) => {
        const start = i * HOLD;
        const local = frame - start;
        if (local < -XFADE || local > HOLD + XFADE) return null;
        const inP = i === 0 ? 1 : interpolate(local, [-XFADE, 0], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
        const outP = i === PRODUCTS.length - 1 ? 1 : interpolate(local, [HOLD - XFADE, HOLD], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
        const scale = interpolate(local, [-XFADE, HOLD + XFADE], [1.0, 1.04]);
        return (
          <div key={p} style={{position: 'absolute', top: 480, width: '100%', display: 'flex', justifyContent: 'center', opacity: Math.min(inP, outP)}}>
            <Img src={staticFile(`media/${p}`)} style={{width: 640, borderRadius: 14, boxShadow: '0 40px 90px rgba(0,0,0,0.5)', transform: `scale(${scale}) translateX(${(1 - inP) * 30}px)`}} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Quote: React.FC = () => {
  const stars = useReveal(6);
  const q = useReveal(18, 30);
  const who = useReveal(40);
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center', padding: '0 110px', textAlign: 'center', color: CREAM}}>
      <div style={{fontSize: 44, letterSpacing: 14, color: '#d9b45a', ...stars}}>★★★★★</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 68, lineHeight: 1.35, marginTop: 50, ...q}}>
        “The selection is always on-trend, and the quality is amazing.”
      </div>
      <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 30, letterSpacing: 10, color: MUTED, marginTop: 50, ...who}}>— MAZEN</div>
    </AbsoluteFill>
  );
};

const PIN = {x: 538, y: 341}; // Praga Outlet pin inside map.png (1080x746)
const Beirut: React.FC = () => {
  const zoom = useDrift(2.2, 2.5, 110);
  return (
    <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
      <Img
        src={staticFile('media/map.png')}
        style={{position: 'absolute', left: 540 - PIN.x, top: 860 - PIN.y, width: 1080, transformOrigin: `${PIN.x}px ${PIN.y}px`, transform: `scale(${zoom})`, filter: 'grayscale(0.35) brightness(0.8)'}}
      />
      {/* Fades hide the Google Maps info card and button, which sit above-left of the pin. */}
      <AbsoluteFill style={{background: `linear-gradient(to right, ${BG} 18%, transparent 38%)`}} />
      <AbsoluteFill style={{background: `linear-gradient(to bottom, ${BG} 30%, rgba(12,11,10,0.1) 41%, rgba(12,11,10,0.1) 66%, ${BG} 80%)`}} />
      <Caption title="Visit us in Beirut" sub="OR SHOP ONLINE" delay={14} style={{position: 'absolute', top: 1520}} />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const logo = useReveal(6, 36);
  const url = useReveal(30);
  const note = useReveal(44);
  const frame = useCurrentFrame();
  const line = interpolate(frame, [26, 60], [0, 260], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <AbsoluteFill style={{background: BG, justifyContent: 'center', alignItems: 'center'}}>
      <Logo width={820} style={logo} />
      <div style={{width: line, height: 2, background: RED, margin: '50px 0 44px'}} />
      <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 54, letterSpacing: 8, color: CREAM, ...url}}>pragaoutlet.com</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: MUTED, marginTop: 30, ...note}}>Free delivery on orders $120+</div>
    </AbsoluteFill>
  );
};

const FADE = 20;
const SCENES: [React.FC, number][] = [
  [Opening, 84],
  [Hero, 110],
  [Phone, 190],
  [Products, PRODUCTS.length * HOLD + 10],
  [Quote, 110],
  [Beirut, 110],
  [Outro, 140],
];
export const siteFilmDuration = SCENES.reduce((t, [, d]) => t + d, 0) - FADE * (SCENES.length - 1);

export const SiteFilm: React.FC = () => (
  <AbsoluteFill style={{background: BG}}>
    <Audio src={staticFile('audio/soft.wav')} />
    <TransitionSeries>
      {SCENES.flatMap(([Scene, d], i) => [
        ...(i > 0 ? [<TransitionSeries.Transition key={`t${i}`} presentation={fade()} timing={linearTiming({durationInFrames: FADE})} />] : []),
        <TransitionSeries.Sequence key={`s${i}`} durationInFrames={d}>
          <Scene />
        </TransitionSeries.Sequence>,
      ])}
    </TransitionSeries>
  </AbsoluteFill>
);
