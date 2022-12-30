import { z } from 'zod';
export const DEFAULT_COUNTRY_CODE = 'AWO';
export const AVERAGE_REGION_NAME_TO_COUNTRY_CODE = new Map([
  ['Average Oceania', 'AOC'],
  ['Average Europe', 'AEU'],
  ['Average Asia', 'AAS'],
  ['Average Americas', 'AAM'],
  ['Average Africa', 'AAF'],
  ['0', DEFAULT_COUNTRY_CODE],
]);

export const RegionSchema = z.object({
  pppIndex: z.number(),
  countryCode: z.string(),
  countryName: z.string(),
  ituc: z.number(),
});

export type Region = z.infer<typeof RegionSchema>;
