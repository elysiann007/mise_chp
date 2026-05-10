export const KDV_RATES = {
  FOOD: 0.1,
  BEVERAGE: 0.1,
  ALCOHOL: 0.2,
} as const;

export const OTV_RATE_ALCOHOL = 0.1; // ÖTV rate on alcohol (applied to pre-KDV price)

// Alcohol sales are restricted between these hours (22:00 - 06:00)
export const ALCOHOL_BLOCK_START_HOUR = 22;
export const ALCOHOL_BLOCK_END_HOUR = 6;

export const SESSION_TTL_HOURS = 4;
export const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;
