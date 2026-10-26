import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Built from a phone screen recording of pragaoutlet.com (public/media/site.mp4, 1080x2170)
// plus product cards and the map cropped from that recording.

const RED = '#E10600';
const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const SITE = staticFile('media/site.mp4');
const SITE_ASPECT = 2170 / 1080;

const PRODUCTS = [
  {img: 'p1.png', price: 55},
  {img: 'p2.png', price: 95},
  {img: 'p3.png', price: 50},
  {img: 'p4.png', price: 50},
  {img: 'p5.png', price: 15},
  {img: 'p6.png', price: 45},
  {img: 'p7.png', price: 59},
];

const usePop = (delay = 0, damping = 12, mass = 1) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, mass}});
};

// Screen recording clip starting at `from` seconds of the source.
const Site: React.FC<{from: number; style?: React.CSSProperties; position?: string}> = ({from, style, position = 'top'}) => (
  <OffthreadVideo src={SITE} muted trimBefore={Math.round(from * 30)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, ...style}} />
);

const Sticker: React.FC<{children: React.ReactNode; rotate?: number; style?: React.CSSProperties}> = ({children, rotate = -6, style}) => (
  <div style={{background: RED, color: 'white', fontFamily: FONT, fontWeight: 900, padding: '14px 34px', borderRadius: 10, transform: `rotate(${rotate}deg)`, boxShadow: '0 12px 40px rgba(0,0,0,0.45)', ...style}}>
    {children}
  </div>
);

const Marquee: React.FC<{text: string; y: number; speed: number; size?: number}> = ({text, y, speed, size = 230}) => {
  const frame = useCurrentFrame();
  const x = ((frame * speed) % 2400) - 2400;
  return (
    <div style={{position: 'absolute', top: y, left: 0, whiteSpace: 'nowrap', transform: `translateX(${speed > 0 ? x : -2400 - x}px)`, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, color: 'transparent', WebkitTextStroke: '3px rgba(255,255,255,0.14)'}}>
      {Array(8).fill(text).join(' ')}
    </div>
  );
};

// 1. Hook: the real homepage hero, punched in.
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 20], [1.45, 1.05], {extrapolateRight: 'clamp'});
  const sticker = usePop(18, 9);
  const logo = usePop(4, 14);
  return (
    <AbsoluteFill style={{background: 'black'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Site from={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.75))'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <Img src={staticFile('logo.png')} style={{width: 1100, marginTop: -260, opacity: logo, transform: `scale(${2 - logo})`}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 1080, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Sticker style={{fontSize: 92, transform: `rotate(-6deg) scale(${sticker})`}}>JUST DROPPED</Sticker>
      </div>
    </AbsoluteFill>
  );
};

// 2. The site playing inside a floating 3D phone.
const Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 14);
  const rotY = interpolate(frame, [0, 180], [-22, 16]);
  const rotX = interpolate(frame, [0, 180], [8, 2]);
  const w = 600;
  const t = 2 + frame / 30; // source time
  const label = t < 4 ? 'MEN' : t < 5.4 ? 'WOMEN' : 'NEW ARRIVALS';
  const labelStart = t < 4 ? 0 : t < 5.4 ? 60 : 102;
  const labelPop = usePop(labelStart, 10);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 60%, #3a0000, #0a0a0a 70%)`}}>
      <Marquee text="PRAGA • DESIGNER • OUTLET •" y={180} speed={9} />
      <Marquee text="MEN • WOMEN • NEW SEASON •" y={1500} speed={-9} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', perspective: 1800}}>
        <div
          style={{
            width: w,
            height: w * SITE_ASPECT,
            borderRadius: 72,
            border: '16px solid #111',
            outline: '3px solid #444',
            overflow: 'hidden',
            boxShadow: '0 60px 120px rgba(0,0,0,0.7), 0 0 120px rgba(225,6,0,0.35)',
            transform: `translateY(${(1 - enter) * 1400}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(0.92)`,
          }}
        >
          <Site from={2} />
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 150, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Sticker rotate={-4} style={{fontSize: 96, transform: `rotate(-4deg) scale(${labelPop})`}}>{label}</Sticker>
      </div>
    </AbsoluteFill>
  );
};

// 3. Product cards slam down into a pile, each with a price burst.
const PER = 28;
const ROT = [-7, 6, -4, 8, -6, 5, -2];
const DX = [-60, 70, -40, 50, -70, 40, 0];
const Drop: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const current = Math.min(Math.floor(frame / PER), PRODUCTS.length - 1);
  const sinceLand = frame - current * PER;
  const shake = sinceLand < 8 ? Math.sin(sinceLand * 2.5) * (8 - sinceLand) * 2.2 : 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${RED}, #5a0000 55%, #120000)`, transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      <Marquee text="NEW ARRIVALS •" y={60} speed={14} size={200} />
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 110, color: 'white', letterSpacing: -2}}>
        NEW ARRIVALS
      </div>
      <div style={{position: 'absolute', top: 250, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 48, color: 'rgba(255,255,255,0.8)'}}>
        {String(current + 1).padStart(2, '0')} / {String(PRODUCTS.length).padStart(2, '0')}
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', top: 140}}>
        {PRODUCTS.map((p, i) => {
          if (frame < i * PER) return null;
          const s = spring({frame: frame - i * PER, fps, config: {damping: 13, mass: 0.7}});
          const burst = spring({frame: frame - i * PER - 8, fps, config: {damping: 8}});
          const isTop = i === current;
          return (
            <div
              key={p.img}
              style={{
                position: 'absolute',
                width: 640,
                transform: `translate(${DX[i]}px, ${(1 - s) * -1600}px) rotate(${ROT[i] * s + (1 - s) * 25}deg) scale(${1 + (1 - s) * 0.4})`,
                filter: isTop ? 'none' : 'brightness(0.55)',
              }}
            >
              <Img src={staticFile(`media/${p.img}`)} style={{width: '100%', borderRadius: 18, border: '10px solid white', boxShadow: '0 40px 80px rgba(0,0,0,0.5)'}} />
              {isTop && (
                <div
                  style={{
                    position: 'absolute',
                    top: -60,
                    right: -70,
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    background: 'black',
                    border: `8px solid ${RED}`,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: FONT,
                    fontWeight: 900,
                    fontSize: 96,
                    transform: `scale(${burst}) rotate(${(1 - burst) * -90 + 12}deg)`,
                  }}
                >
                  ${p.price}
                </div>
              )}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 4. Men / women split screen from the real collection pages.
const Split: React.FC = () => {
  const top = usePop(0, 14);
  const bottom = usePop(5, 14);
  const lt = usePop(12, 10);
  const lb = usePop(17, 10);
  return (
    <AbsoluteFill style={{background: 'black'}}>
      <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 952, overflow: 'hidden', transform: `translateX(${(1 - top) * -1080}px)`}}>
        <Site from={19.5} position="50% 30%" />
        <Sticker rotate={-5} style={{position: 'absolute', bottom: 60, left: 50, fontSize: 120, transform: `rotate(-5deg) scale(${lt})`}}>MEN</Sticker>
      </div>
      <div style={{position: 'absolute', top: 968, left: 0, width: 1080, height: 952, overflow: 'hidden', transform: `translateX(${(1 - bottom) * 1080}px)`}}>
        <Site from={13} position="50% 40%" />
        <Sticker rotate={4} style={{position: 'absolute', top: 60, right: 50, fontSize: 120, transform: `rotate(4deg) scale(${lb})`}}>WOMEN</Sticker>
      </div>
      <div style={{position: 'absolute', top: 952, height: 16, width: '100%', background: RED}} />
    </AbsoluteFill>
  );
};

// 5. Store location: zoom into the real map, drop a pin.
const PIN = {x: 538, y: 341}; // pin position inside map.png (1080x746)
const Beirut: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 90], [1.3, 2.1]);
  const pin = usePop(14, 9);
  const text = usePop(24, 12);
  const ring = (frame % 30) / 30;
  const mapW = 1080 * 1.8;
  return (
    <AbsoluteFill style={{background: '#0a0a0a', overflow: 'hidden'}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'relative', width: mapW, transform: `scale(${zoom / 1.8})`, transformOrigin: 'center'}}>
          <Img src={staticFile('media/map.png')} style={{width: '100%', display: 'block', transform: `translate(${(540 - PIN.x) * 1.8}px, ${(373 - PIN.y) * 1.8}px)`}} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 25%, rgba(0,0,0,0.85) 70%)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'absolute', width: 260, height: 260, borderRadius: '50%', border: `6px solid ${RED}`, opacity: (1 - ring) * pin, transform: `scale(${0.3 + ring})`}} />
        <svg width="150" height="200" viewBox="0 0 24 32" style={{transform: `translateY(${-100 + (1 - pin) * -700}px)`}}>
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill={RED} stroke="white" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="4.5" fill="white" />
        </svg>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', fontFamily: FONT, color: 'white', opacity: text, transform: `translateY(${(1 - text) * -80}px)`}}>
        <div style={{fontSize: 60, fontWeight: 600, letterSpacing: 14}}>VISIT US IN</div>
        <div style={{fontSize: 210, fontWeight: 900, lineHeight: 1, letterSpacing: -4}}>BEIRUT</div>
      </div>
      <div style={{position: 'absolute', bottom: 260, width: '100%', display: 'flex', justifyContent: 'center', opacity: text}}>
        <Sticker rotate={-3} style={{fontSize: 64}}>OR SHOP ONLINE</Sticker>
      </div>
    </AbsoluteFill>
  );
};

// 6. Real testimonials with stars popping over.
const Reviews: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = interpolate(frame, [0, 66], [1, 1.08]);
  return (
    <AbsoluteFill style={{background: 'white'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 30%'}}>
        <Img src={staticFile('media/reviews.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(to top, rgba(10,10,10,0.97) 30%, transparent 58%)'}} />
      <div style={{position: 'absolute', bottom: 330, width: '100%', display: 'flex', justifyContent: 'center', gap: 16}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const s = spring({frame: frame - 6 - i * 4, fps, config: {damping: 8}});
          return (
            <svg key={i} width="140" height="140" viewBox="0 0 24 24" style={{transform: `scale(${s}) rotate(${(1 - s) * 180}deg)`}}>
              <path d="M12 2l3 6.6 7.2.7-5.4 4.8 1.6 7.1L12 17.6 5.6 21.2l1.6-7.1L1.8 9.3 9 8.6z" fill="#FFC21A" stroke="#b07a00" strokeWidth="0.6" />
            </svg>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 190, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 86, color: 'white', opacity: interpolate(frame, [16, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        LOVED IN BEIRUT
      </div>
    </AbsoluteFill>
  );
};

// 7. Outro.
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = usePop(0, 10);
  const a = usePop(14, 12);
  const b = usePop(26, 9);
  const glow = interpolate(Math.sin(frame / 6), [-1, 1], [0.25, 0.55]);
  return (
    <AbsoluteFill style={{background: '#0a0a0a', justifyContent: 'center', alignItems: 'center', fontFamily: FONT, color: 'white'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, rgba(225,6,0,${glow}), transparent 60%)`}} />
      <Img src={staticFile('logo.png')} style={{width: 1150, marginTop: -320, transform: `scale(${3 - 2 * logo})`, opacity: logo}} />
      <div style={{marginTop: -170, fontSize: 58, fontWeight: 700, opacity: a, transform: `translateY(${(1 - a) * 50}px)`}}>
        Free delivery on orders $120+
      </div>
      <div style={{marginTop: 70, background: 'white', color: 'black', borderRadius: 999, padding: '34px 80px', fontSize: 84, fontWeight: 900, transform: `scale(${b})`, boxShadow: `0 0 80px rgba(225,6,0,${glow})`}}>
        pragaoutlet.com
      </div>
    </AbsoluteFill>
  );
};

const SCENES: [React.FC, number][] = [
  [Hook, 72],
  [Phone, 180],
  [Drop, PER * PRODUCTS.length + 24],
  [Split, 96],
  [Beirut, 96],
  [Reviews, 66],
  [Outro, 105],
];
export const siteReelDuration = SCENES.reduce((t, [, d]) => t + d, 0);

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: 'white', opacity: interpolate(frame, [0, 6], [0.9, 0], {extrapolateRight: 'clamp'})}} />;
};

export const SiteReel: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{background: 'black'}}>
      {SCENES.map(([Scene, d], i) => {
        const start = from;
        from += d;
        return (
          <Sequence key={i} from={start} durationInFrames={d}>
            <Scene />
            <Flash />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
