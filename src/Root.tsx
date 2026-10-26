import {Composition} from 'remotion';
import {Praga} from './Praga';
import {Promo} from './Promo';
import {ProductAd, productAdDefaults} from './ProductAd';

export const Root: React.FC = () => (
  <>
    <Composition id="Praga" component={Praga} durationInFrames={90} fps={30} width={1080} height={1080} />
    <Composition id="Promo" component={Promo} durationInFrames={480} fps={30} width={1080} height={1920} />
    <Composition id="ProductAd" component={ProductAd} defaultProps={productAdDefaults} durationInFrames={240} fps={30} width={1080} height={1920} />
  </>
);
