import type { MutableRefObject } from 'react';

export type FlameEnergy = MutableRefObject<{ value: number }>;

export type CandleSceneProps = {
  active: boolean;
  compact: boolean;
  isLit: boolean;
  mobile: boolean;
  onContextLost: () => void;
  onToggle: () => void;
  reducedMotion: boolean;
};
