export type CandleDecoration = 'none' | 'hearts' | 'daisy' | 'rose' | 'petals';

export type CandleCustomization = {
  wax_color: string;
  wax_color_name: string;
  decoration: CandleDecoration;
  decoration_label: string;
  decoration_color: string;
  glitter: boolean;
};

export type CandleVisual = {
  id: string;
  label: string;
  waxColor: string;
  decoration: CandleDecoration;
  decorationColor: string;
  glitter: boolean;
  vesselColor: string;
};

export type DeviceTiltValue = {
  active: boolean;
  x: number;
  y: number;
};
