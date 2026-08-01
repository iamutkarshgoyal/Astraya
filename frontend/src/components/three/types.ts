import type { MutableRefObject } from 'react';

import type { CandleVisual, DeviceTiltValue } from '@/types/customization';

export type FlameEnergy = MutableRefObject<{ value: number }>;
export type DeviceTiltRef = MutableRefObject<DeviceTiltValue>;

export type CandleSceneProps = {
  active: boolean;
  compact: boolean;
  isLit: boolean;
  mobile: boolean;
  onContextLost: () => void;
  onToggle: () => void;
  reducedMotion: boolean;
  tiltRef: DeviceTiltRef;
  visual: CandleVisual;
};
