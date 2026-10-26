import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const Praga: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
  const scale = interpolate(frame, [0, 90], [0.8, 1]);
  return (
    <AbsoluteFill style={{backgroundColor: 'white', justifyContent: 'center', alignItems: 'center'}}>
      <Img src={staticFile('logo.png')} style={{width: 600, opacity, transform: `scale(${scale})`}} />
    </AbsoluteFill>
  );
};
