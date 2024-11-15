import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import deepFreeze from 'deep-freeze';
import { Translations } from '../language/translations';
import { gte } from '@mr42/version-comparator/dist/version.comparator';

function removeShortNameInName(name: string, shortName: string): string {
  return name.replace(shortName, '').trimStart();
}

const AspectSchema = z
  .object({
    type: z.string(),
    isPositive: z.boolean(),
    shortName: z.string(),
    name: z.string(),
    description: z.string(),
  })
  .transform((a) => ({
    ...a,
    name: removeShortNameInName(a.name, a.shortName),
  }));
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
  .transform((ts) => {
    const topic = { ..._.omit(ts.topics, 'aspects'), isPositive: true };
    return [
      { ...topic, name: removeShortNameInName(topic.name, topic.shortName) },
      ...ts.topics.aspects,
    ];
  });
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
  isPositive: boolean;
};

type WorkbookOpts = {
  version: BalanceSheetVersion;
  type: BalanceSheetType;
  groups: readonly WorkbookGroup[];
  ratings: readonly WorbookRating[];
};

export type Workbook = WorkbookOpts & {
  findByShortName(shortName: string): WorbookRating | undefined;
};

export function makeWorkbook({
  version,
  type,
  groups,
  ratings,
}: WorkbookOpts): Workbook {
  function findByShortName(shortName: string): WorbookRating | undefined {
    return ratings.find((wr) => wr.shortName === shortName);
  }

  return deepFreeze({
    version,
    type,
    groups,
    ratings,
    findByShortName,
  });
}

makeWorkbook.fromFile = function fromJson(
  version: BalanceSheetVersion,
  type: BalanceSheetType,
  lng: keyof Translations
): Workbook {
  const versionPath = gte(version, BalanceSheetVersion.v5_1_0)
    ? '5.10'
    : '5.08';

  const typePath = gte(version, BalanceSheetVersion.v5_1_0)
    ? 'full'
    : type.toString().toLowerCase();

  const workbookPath = path.join(
    path.resolve(__dirname, '../files/workbook'),
    `${lng}_${typePath}_${versionPath}.json`
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

  return makeWorkbook({ version, type, groups, ratings });
};
