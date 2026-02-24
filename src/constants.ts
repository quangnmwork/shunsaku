export const SCREENS = {
  SETUP_1: 'setup_1',
  SETUP_2: 'setup_2',
  SETUP_3: 'setup_3',
  DASHBOARD: 'dashboard',
  RECORD_1: 'record_1',
  RECORD_2: 'record_2',
  RECORD_MISSED: 'record_missed',
  RECORD_DONE: 'record_done',
} as const;

export type Screen = (typeof SCREENS)[keyof typeof SCREENS];

export const colors = {
  bg: '#F5F5F5',
  white: '#FFFFFF',
  red: '#E2001A',
  gray: '#9E9E9E',
  dark: '#424242',
  light: '#EEEEEE',
  warn: '#FF9800',
  green: '#2E7D32',
  greenBg: '#E8F5E9',
  blue: '#1565C0',
  blueBg: '#E3F2FD',
  warnBg: '#FFF8E1',
} as const;

export const ANOMALY_THRESHOLD = 0.3;
export const DEFAULT_UNIT_PRICE = 172;

export interface BikeModel {
  id: string;
  name: string;
  catalog: number;
}

export const BIKES: BikeModel[] = [
  { id: 'cb125r', name: 'CB125R', catalog: 52 },
  { id: 'pcx125', name: 'PCX125', catalog: 55 },
  { id: 'crf250l', name: 'CRF250L', catalog: 40 },
  { id: 'cbr500r', name: 'CBR500R', catalog: 28 },
  { id: 'super_cub', name: 'スーパーカブ110', catalog: 105 },
];
