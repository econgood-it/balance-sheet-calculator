import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import _, { parseInt } from 'lodash';
import deepFreeze from 'deep-freeze';
import { parseLanguageParameter, Translations } from '../language/translations';
import { gte } from '@mr42/version-comparator/dist/version.comparator';
import { Request } from 'express';
import { WorkbookResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/workbook.dto';

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

type WorbookRatingApi = {
  type: string;
  shortName: string;
  name: string;
  isPositive: boolean;
};

type EvaluationLevel = {
  level: number;
  name: string;
  pointsFrom: number;
  pointsTo: number;
};

type WorkbookOpts = {
  version: BalanceSheetVersion;
  type: BalanceSheetType;
  groups: readonly WorkbookGroup[];
  evaluationLevels: readonly EvaluationLevel[];
  ratings: readonly WorbookRating[];
};

type WorkbookOptsApi = {
  version: BalanceSheetVersion;
  type: BalanceSheetType;
  groups: readonly WorkbookGroup[];
  evaluationLevels: readonly EvaluationLevel[];
  ratings: readonly WorbookRatingApi[];
};

export type Workbook = WorkbookOpts & {
  findByShortName(shortName: string): WorbookRating | undefined;
  toJson(): z.infer<typeof WorkbookResponseBodySchema>;
};

export type WorkbookApi = WorkbookOptsApi & {
  findByShortName(shortName: string): WorbookRatingApi | undefined;
  toJson(): z.infer<typeof WorkbookResponseBodySchema>;
};

export function makeWorkbook({
  version,
  type,
  groups,
  evaluationLevels,
  ratings,
}: WorkbookOpts): Workbook {
  function findByShortName(shortName: string): WorbookRating | undefined {
    return ratings.find((wr) => wr.shortName === shortName);
  }
  function toJson() {
    return WorkbookResponseBodySchema.parse({
      version,
      type,
      groups: groups.map((g) => ({
        shortName: g.shortName,
        name: g.name,
      })),
      evaluationLevels,
    });
  }

  return deepFreeze({
    version,
    type,
    groups,
    evaluationLevels,
    ratings,
    findByShortName,
    toJson,
  });
}

export function makeWorkbookApi({
  version,
  type,
  groups,
  evaluationLevels,
  ratings,
}: WorkbookOptsApi): WorkbookApi {
  function findByShortName(shortName: string): WorbookRatingApi | undefined {
    return ratings.find((wr) => wr.shortName === shortName);
  }
  function toJson() {
    return WorkbookResponseBodySchema.parse({
      version,
      type,
      groups: groups.map((g) => ({
        shortName: g.shortName,
        name: g.name,
      })),
      evaluationLevels,
    });
  }

  return deepFreeze({
    version,
    type,
    groups,
    evaluationLevels,
    ratings,
    findByShortName,
    toJson,
  });
}

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

const TopicSchemaApi = z
.object({
  topics: z.object({
    type: z.string(),
    shortName: z.string(),
    name: z.string(),
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
    name: removeShortNameInName(g.group.name, `${g.group.shortName}.`),
    ratings: g.group.values.flat(),
  }));

  export const GroupSchemaApi = z
  .object({
    shortName: z.string(),
    name: z.string(),
    values: TopicSchemaApi.array(),
  })
  .transform((g) => ({
    shortName: g.shortName,
    name: removeShortNameInName(g.name, `${g.shortName}.`),
    ratings: g.values.flat(),
  }));

const EvaluationLevelSchema = z.object({
  level: z.string().transform((s) => parseInt(s)),
  name: z.string(),
  pointsFrom: z.string().transform((s) => parseInt(s)),
  pointsTo: z.string().transform((s) => parseInt(s)),
});

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
  const evaluationLevels = EvaluationLevelSchema.array().parse(
    jsonParsed[0].evaluationLevels
  );
  const parsedGroups = GroupSchema.array().parse(jsonParsed.slice(1));
  const groups: WorkbookGroup[] = [];
  const ratings: WorbookRating[] = [];
  for (const group of parsedGroups) {
    groups.push(_.omit(group, 'ratings'));
    ratings.push(...group.ratings);
  }

  return makeWorkbook({ version, type, groups, evaluationLevels, ratings });
};

makeWorkbook.fromApiFile = function fromJson(
  version: BalanceSheetVersion,
  type: BalanceSheetType,
  lng: keyof Translations
): WorkbookApi {
  const versionPath = gte(version, BalanceSheetVersion.v5_1_0)
    ? '5.10'
    : '5.08';

  const typePath = gte(version, BalanceSheetVersion.v5_1_0)
    ? 'full'
    : type.toString().toLowerCase();

  const workbookPath = path.join(
    path.resolve(__dirname, '../files/workbook'),
    `${lng}_${typePath}_${versionPath}_api.json`
  );
  const fileText = fs.readFileSync(workbookPath);
  const jsonParsed = JSON.parse(fileText.toString());
  const evaluationLevels = EvaluationLevelSchema.array().parse(
    jsonParsed.evaluationLevels
  );
  console.log(jsonParsed.groups);
  const parsedGroups = GroupSchemaApi.array().parse(jsonParsed.groups);
  const groups: WorkbookGroup[] = [];
  const ratings: WorbookRatingApi[] = [];
  for (const group of parsedGroups) {
    groups.push(_.omit(group, 'ratings'));
    ratings.push(...group.ratings);
  }

  return makeWorkbookApi({ version, type, groups, evaluationLevels, ratings });
};

makeWorkbook.fromRequest = function (req: Request) {
  const language = parseLanguageParameter(req.query.lng);
  const version = z.nativeEnum(BalanceSheetVersion).parse(req.query.version);
  const type = z.nativeEnum(BalanceSheetType).parse(req.query.type);
  return makeWorkbook.fromFile(version, type, language);
};
