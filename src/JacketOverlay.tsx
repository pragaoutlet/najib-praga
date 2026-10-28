import {AbsoluteFill} from 'remotion';
import {CAPTIONS, EndCard, Hook, Label} from './JacketAd';
import {CAPTIONS as SHORT_CAPTIONS, jacketAdShortDuration} from './JacketAdShort';

// Text/graphics only, on a transparent background. Rendered with alpha and laid over the
// untouched iPhone HDR footage by scripts/composite_hdr.sh, so the video's colours never change.

export const JacketOverlay: React.FC = () => (
  <AbsoluteFill>
    <Hook />
    {CAPTIONS.map((c) => (
      <Label key={c.from} c={c} />
    ))}
    <EndCard start={43.6 * 30} />
  </AbsoluteFill>
);

export const JacketShortOverlay: React.FC = () => (
  <AbsoluteFill>
    <Hook />
    {SHORT_CAPTIONS.map((c) => (
      <Label key={c.from} c={c} />
    ))}
    <EndCard start={(jacketAdShortDuration / 30 - 3.0) * 30} />
  </AbsoluteFill>
);
