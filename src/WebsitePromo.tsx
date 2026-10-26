import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const RED = '#E10600';
const FONT = 'Montserrat, Helvetica, Arial, sans-serif';
const URL = 'pragaoutlet.com';
const BRANDS = ['HUGO BOSS', 'Lacoste', 'Paul&Shark', 'Tommy Hilfiger', 'Armani', 'Hermes', 'Burberry', 'Balenciaga', 'Dolce&Gabbana', 'Givenchy'];
const CATEGORIES = ['Polos', 'T-Shirts', 'Jackets', 'Shirts', 'Jeans', 'Swim Trunks', 'Big Sizes'];

// Scale unit so the same layout works in 9:16, 1:1 and 16:9.
const useU = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 1080;
};

const useSpring = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

const Center: React.FC<{children: React.ReactNode; gap?: number}> = ({children, gap = 0}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap, fontFamily: FONT, color: 'white', textAlign: 'center'}}>
    {children}
  </AbsoluteFill>
);

const Intro: React.FC = () => {
  const s = useSpring(0, 18);
  const u = useU();
  return (
    <Center>
      <Img src={staticFile('logo.png')} style={{width: 1100 * u, opacity: s, transform: `scale(${0.6 + 0.4 * s})`}} />
    </Center>
  );
};

const Pitch: React.FC = () => {
  const u = useU();
  const a = useSpring(0);
  const b = useSpring(14);
  return (
    <Center gap={30 * u}>
      <div style={{fontSize: 96 * u, fontWeight: 800, lineHeight: 1.05, opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        DESIGNER FASHION
      </div>
      <div style={{fontSize: 64 * u, fontWeight: 500, opacity: b, transform: `translateY(${(1 - b) * 60}px)`}}>
        for <span style={{color: RED, fontWeight: 800}}>men</span> &amp; <span style={{color: RED, fontWeight: 800}}>women</span>
      </div>
    </Center>
  );
};

const BrandWall: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Center gap={40 * u}>
      <div style={{fontSize: 44 * u, letterSpacing: 10 * u, fontWeight: 600, color: RED}}>THE BRANDS YOU LOVE</div>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 * u, maxWidth: 1000 * u}}>
        {BRANDS.map((b, i) => {
          const s = spring({frame: frame - 10 - i * 5, fps, config: {damping: 12}});
          return (
            <div key={b} style={{border: `${3 * u}px solid rgba(255,255,255,0.8)`, borderRadius: 14 * u, padding: `${16 * u}px ${30 * u}px`, fontSize: 46 * u, fontWeight: 800, textTransform: 'uppercase', opacity: s, transform: `scale(${s})`}}>
              {b}
            </div>
          );
        })}
      </div>
    </Center>
  );
};

const Categories: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const per = 13;
  const i = Math.min(Math.floor(frame / per), CATEGORIES.length - 1);
  const local = frame - i * per;
  const s = interpolate(local, [0, 5], [1.4, 1], {extrapolateRight: 'clamp'});
  return (
    <Center gap={20 * u}>
      <div style={{fontSize: 44 * u, letterSpacing: 10 * u, fontWeight: 600, opacity: 0.7}}>SHOP</div>
      <div style={{fontSize: 170 * u, fontWeight: 900, textTransform: 'uppercase', color: i % 2 ? RED : 'white', transform: `scale(${s})`}}>{CATEGORIES[i]}</div>
    </Center>
  );
};

const Prices: React.FC = () => {
  const u = useU();
  const a = useSpring(0);
  const b = useSpring(10, 9);
  return (
    <Center gap={10 * u}>
      <div style={{fontSize: 90 * u, fontWeight: 800, opacity: a}}>DESIGNER LABELS.</div>
      <div style={{fontSize: 150 * u, fontWeight: 900, color: RED, transform: `scale(${b})`}}>OUTLET PRICES.</div>
    </Center>
  );
};

const Browser: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const appear = useSpring(0);
  const typed = Math.floor(interpolate(frame, [15, 55], [0, URL.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const caret = Math.floor(frame / 8) % 2 === 0;
  const loaded = useSpring(65);
  return (
    <Center>
      <div style={{width: 940 * u, borderRadius: 28 * u, overflow: 'hidden', background: '#1c1c1c', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', transform: `translateY(${(1 - appear) * 200}px)`, opacity: appear}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14 * u, padding: 24 * u, background: '#2a2a2a'}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{width: 22 * u, height: 22 * u, borderRadius: '50%', background: c}} />
          ))}
          <div style={{flex: 1, marginLeft: 16 * u, background: '#111', borderRadius: 40 * u, padding: `${14 * u}px ${28 * u}px`, fontSize: 40 * u, textAlign: 'left'}}>
            {URL.slice(0, typed)}
            <span style={{opacity: caret && typed < URL.length ? 1 : 0}}>|</span>
          </div>
        </div>
        <div style={{height: 520 * u, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a'}}>
          {/* The logo PNG has wide transparent padding; crop to the wordmark. */}
          <div style={{height: 220 * u, overflow: 'hidden', opacity: loaded, transform: `scale(${0.8 + 0.2 * loaded})`}}>
            <Img src={staticFile('logo.png')} style={{width: 640 * u, marginTop: -250 * u}} />
          </div>
          <div style={{marginTop: 40 * u, background: RED, borderRadius: 12 * u, padding: `${14 * u}px ${44 * u}px`, fontSize: 38 * u, fontWeight: 800, opacity: loaded}}>SHOP NOW</div>
        </div>
      </div>
    </Center>
  );
};

const Outro: React.FC = () => {
  const u = useU();
  const a = useSpring(0);
  const b = useSpring(12);
  const c = useSpring(24);
  return (
    <Center>
      <Img src={staticFile('logo.png')} style={{width: 800 * u, opacity: a, transform: `scale(${0.8 + 0.2 * a})`}} />
      <div style={{marginTop: -80 * u, fontSize: 56 * u, fontWeight: 600, opacity: b}}>Shop online or visit us in Beirut</div>
      <div style={{height: 8 * u, width: interpolate(c, [0, 1], [0, 700 * u]), background: RED, margin: `${30 * u}px 0`}} />
      <div style={{fontSize: 90 * u, fontWeight: 900, opacity: c, transform: `scale(${0.9 + 0.1 * c})`}}>{URL}</div>
    </Center>
  );
};

const SCENES: [React.FC, number][] = [
  [Intro, 75],
  [Pitch, 75],
  [BrandWall, 120],
  [Categories, 7 * 13 + 10],
  [Prices, 75],
  [Browser, 120],
  [Outro, 105],
];
export const websitePromoDuration = SCENES.reduce((t, [, d]) => t + d, 0);

export const WebsitePromo: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(Math.sin(frame / 20), [-1, 1], [0.15, 0.4]);
  let from = 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 100%, rgba(225,6,0,${glow}), transparent 60%)`}} />
      {SCENES.map(([Scene, d], i) => {
        const start = from;
        from += d;
        return (
          <Sequence key={i} from={start} durationInFrames={d}>
            <Scene />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
