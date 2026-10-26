import {Composition} from 'remotion';
import {Praga} from './Praga';

export const Root: React.FC = () => (
  <Composition id="Praga" component={Praga} durationInFrames={90} fps={30} width={1080} height={1080} />
);
