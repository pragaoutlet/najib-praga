import {AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const RED = '#E10600';
const FONT = 'Montserrat, Helvetica, Arial, sans-serif';
const BRANDS = ['Prada', 'Givenchy', 'Tommy Hilfiger', 'BOSS', 'Dolce&Gabbana', 'Paul&Shark', 'Moncler', 'Balenciaga'];

const useIn = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

const Center: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, color: 'white', textAlign: 'center'}}>
    {children}
  </AbsoluteFill>
);

const LogoScene: React.FC = () => {
  const s = useIn(0, 18);
  return (
    <Center>
      <Img src={staticFile('logo.png')} style={{width: 1000, opacity: s, transform: `scale(${0.7 + 0.3 * s})`}} />
    </Center>
  );
};

const TaglineScene: React.FC = () => {
  const a = useIn(0);
  const b = useIn(15);
  return (
    <Center>
      <div style={{fontSize: 110, fontWeight: 800, lineHeight: 1.1, opacity: a, transform: `translateY(${(1 - a) * 60}px)`}}>
        DESIGNER
        <br />
        BRANDS.
      </div>
      <div style={{fontSize: 110, fontWeight: 800, lineHeight: 1.1, marginTop: 30, color: RED, opacity: b, transform: `translateY(${(1 - b) * 60}px)`}}>
        OUTLET
        <br />
        PRICES.
      </div>
    </Center>
  );
};

const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const per = 14;
  return (
    <Center>
      {BRANDS.map((b, i) => {
        const p = interpolate(frame, [i * per, i * per + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const active = frame >= i * per && frame < (i + 1) * per + 6;
        return (
          <div
            key={b}
            style={{
              fontSize: 84,
              fontWeight: 800,
              textTransform: 'uppercase',
              margin: '14px 0',
              opacity: p * (active ? 1 : 0.35),
              color: active ? RED : 'white',
              transform: `translateX(${(1 - p) * -120}px)`,
            }}
          >
            {b}
          </div>
        );
      })}
    </Center>
  );
};

const PriceScene: React.FC = () => {
  const a = useIn(0);
  const b = useIn(12, 10);
  return (
    <Center>
      <div style={{fontSize: 70, fontWeight: 600, letterSpacing: 12, opacity: a}}>T-SHIRTS FROM</div>
      <div style={{fontSize: 360, fontWeight: 900, color: RED, transform: `scale(${b})`, lineHeight: 1}}>$20</div>
    </Center>
  );
};

const CtaScene: React.FC = () => {
  const a = useIn(0);
  const b = useIn(12);
  const w = interpolate(b, [0, 1], [0, 640]);
  return (
    <Center>
      <Img src={staticFile('logo.png')} style={{width: 700, opacity: a, transform: `scale(${0.8 + 0.2 * a})`}} />
      <div style={{fontSize: 80, fontWeight: 800, marginTop: -40, opacity: b}}>SHOP NOW</div>
      <div style={{height: 8, width: w, background: RED, margin: '24px 0'}} />
      <div style={{fontSize: 60, fontWeight: 600, opacity: b, letterSpacing: 2}}>pragaoutlet.com</div>
    </Center>
  );
};

export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(Math.sin(frame / 20), [-1, 1], [0.15, 0.4]);
  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0a'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 100%, rgba(225,6,0,${glow}), transparent 60%)`}} />
      <Sequence from={0} durationInFrames={90}><LogoScene /></Sequence>
      <Sequence from={90} durationInFrames={90}><TaglineScene /></Sequence>
      <Sequence from={180} durationInFrames={140}><BrandScene /></Sequence>
      <Sequence from={320} durationInFrames={70}><PriceScene /></Sequence>
      <Sequence from={390} durationInFrames={90}><CtaScene /></Sequence>
    </AbsoluteFill>
  );
};
