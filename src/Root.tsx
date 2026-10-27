import {Composition} from 'remotion';
import {Praga} from './Praga';
import {Promo} from './Promo';
import {ProductAd, productAdDefaults} from './ProductAd';
import {WebsitePromo, websitePromoDuration} from './WebsitePromo';
import {SiteReel, siteReelDuration} from './SiteReel';
import {SiteFilm, siteFilmDuration} from './SiteFilm';
import {GiletAd, giletAdDuration} from './GiletAd';

export const Root: React.FC = () => (
  <>
    <Composition id="Praga" component={Praga} durationInFrames={90} fps={30} width={1080} height={1080} />
    <Composition id="Promo" component={Promo} durationInFrames={480} fps={30} width={1080} height={1920} />
    <Composition id="ProductAd" component={ProductAd} defaultProps={productAdDefaults} durationInFrames={240} fps={30} width={1080} height={1920} />
    <Composition id="WebsitePromo" component={WebsitePromo} durationInFrames={websitePromoDuration} fps={30} width={1080} height={1920} />
    <Composition id="WebsitePromoWide" component={WebsitePromo} durationInFrames={websitePromoDuration} fps={30} width={1920} height={1080} />
    <Composition id="SiteReel" component={SiteReel} durationInFrames={siteReelDuration} fps={30} width={1080} height={1920} />
    <Composition id="SiteFilm" component={SiteFilm} durationInFrames={siteFilmDuration} fps={30} width={1080} height={1920} />
    <Composition id="GiletAdWhatsApp" component={GiletAd} defaultProps={{cta: 'whatsapp' as const}} durationInFrames={giletAdDuration} fps={30} width={1080} height={1920} />
    <Composition id="GiletAdWeb" component={GiletAd} defaultProps={{cta: 'web' as const}} durationInFrames={giletAdDuration} fps={30} width={1080} height={1920} />
  </>
);
