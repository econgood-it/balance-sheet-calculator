import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import deepFreeze from 'deep-freeze';
import { Translations } from '../language/translations';

const AspectSchema = z.object({
  type: z.string(),
  isPositive: z.boolean(),
  shortName: z.string(),
  name: z.string(),
  description: z.string(),
});
const TopicSchema = z
  .object({
    topics: z.object({
      type: z.string(),
      shortName: z.string(),
      name: z.string(),
      description: z.string(),
      aspects: AspectSchema.array(),
    }),
  })
  .transform((ts) => [_.omit(ts.topics, 'aspects'), ...ts.topics.aspects]);
export const GroupSchema = z
  .object({
    group: z.object({
      shortName: z.string(),
      name: z.string(),
      values: TopicSchema.array(),
    }),
  })
  .transform((g) => ({
    shortName: g.group.shortName,
    name: g.group.name,
    ratings: g.group.values.flat(),
  }));

type WorkbookGroup = {
  shortName: string;
  name: string;
};

type WorbookRating = {
  type: string;
  shortName: string;
  name: string;
  description: string;
};

type WorkbookOpts = {
  version: BalanceSheetVersion;
  groups: readonly WorkbookGroup[];
  ratings: readonly WorbookRating[];
};

export type Workbook = WorkbookOpts & {
  findByShortName(shortName: string): WorbookRating | undefined;
};

export function makeWorkbook({
  version,
  groups,
  ratings,
}: WorkbookOpts): Workbook {
  function findByShortName(shortName: string): WorbookRating | undefined {
    return ratings.find((wr) => wr.shortName === shortName);
  }

  return deepFreeze({
    version,
    groups,
    ratings,
    findByShortName,
  });
}

makeWorkbook.fromFile = function fromJson(
  version: BalanceSheetVersion,
  lng: keyof Translations
): Workbook {
  const workbookPath = path.join(
    path.resolve(__dirname, '../files/workbook'),
    `${lng}.json`
  );
  const fileText = fs.readFileSync(workbookPath);
  const jsonParsed = JSON.parse(fileText.toString());
  const parsedGroups = GroupSchema.array().parse(jsonParsed.slice(1));
  const groups: WorkbookGroup[] = [];
  const ratings: WorbookRating[] = [];
  for (const group of parsedGroups) {
    groups.push(_.omit(group, 'ratings'));
    ratings.push(...group.ratings);
  }

  return makeWorkbook({ version, groups, ratings });
};
