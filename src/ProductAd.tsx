import {AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const RED = '#E10600';
const FONT = 'Montserrat, Helvetica, Arial, sans-serif';

export type ProductAdProps = {
  brand: string;
  title: string;
  price: number;
  sizes: string[];
  /** File inside public/media/, e.g. "moncler.mp4" or "moncler.jpg". Leave empty for the typographic look. */
  media?: string;
};

export const productAdDefaults: ProductAdProps = {
  brand: 'Moncler',
  title: 'T-Shirt',
  price: 25,
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
};

const isVideo = (f: string) => /\.(mp4|mov|webm)$/i.test(f);

export const ProductAd: React.FC<ProductAdProps> = ({brand, title, price, sizes, media}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (delay: number, damping = 14) => spring({frame: frame - delay, fps, config: {damping}});
  const brandIn = pop(8);
  const titleIn = pop(18);
  const priceIn = pop(34, 10);
  const sizesIn = pop(52);
  const ctaIn = pop(70);
  const zoom = interpolate(frame, [0, 240], [1, 1.12]);

  return (
    <AbsoluteFill style={{backgroundColor: '#0a0a0a', fontFamily: FONT, color: 'white'}}>
      {media ? (
        <AbsoluteFill style={{transform: `scale(${zoom})`}}>
          {isVideo(media) ? (
            <OffthreadVideo src={staticFile(`media/${media}`)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <Img src={staticFile(`media/${media}`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          )}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 100%, rgba(225,6,0,0.35), transparent 65%)'}} />
      )}
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 35%, transparent 45%, rgba(0,0,0,0.9) 100%)'}} />

      <AbsoluteFill style={{padding: '120px 80px', justifyContent: 'space-between'}}>
        <div style={{opacity: brandIn, transform: `translateY(${(1 - brandIn) * -40}px)`}}>
          <div style={{fontSize: 64, fontWeight: 600, letterSpacing: 10}}>
            PRA<span style={{color: RED}}>G</span>A
          </div>
        </div>

        <div>
          <div style={{fontSize: 120, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1, opacity: brandIn, transform: `translateX(${(1 - brandIn) * -150}px)`}}>
            {brand}
          </div>
          <div style={{fontSize: 64, fontWeight: 500, marginTop: 12, opacity: titleIn, transform: `translateX(${(1 - titleIn) * -150}px)`}}>{title}</div>

          <div style={{display: 'inline-block', marginTop: 40, background: RED, padding: '10px 50px', borderRadius: 16, fontSize: 150, fontWeight: 900, transform: `scale(${priceIn})`, transformOrigin: 'left center'}}>
            ${price}
          </div>

          <div style={{display: 'flex', gap: 20, marginTop: 40, opacity: sizesIn}}>
            {sizes.map((s) => (
              <div key={s} style={{border: '3px solid white', borderRadius: 12, padding: '8px 22px', fontSize: 44, fontWeight: 700}}>
                {s}
              </div>
            ))}
          </div>

          <div style={{marginTop: 60, fontSize: 48, fontWeight: 700, opacity: ctaIn, transform: `translateY(${(1 - ctaIn) * 40}px)`}}>
            SHOP NOW · <span style={{color: RED}}>pragaoutlet.com</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
