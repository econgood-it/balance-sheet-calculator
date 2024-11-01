import { z } from 'zod';
import {
  SectionSchema,
  WorkbookResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/workbook.dto';
import deepFreeze from 'deep-freeze';

export type WorkbookSectionOld = z.infer<typeof SectionSchema>;

const AspectSchema = z
  .object({
    label: z.string(),
    title: z.string(),
  })
  .transform((a) => ({ shortName: `${a.title[0]}${a.label}`, title: a.title }));

const ValueSchema = z
  .object({
    label: z.string(),
    cell: z.object({
      label: z.string(),
      title: z.string(),
      aspects: AspectSchema.array(),
    }),
  })
  .transform((v) => [
    { shortName: v.cell.label, title: v.cell.title },
    ...v.cell.aspects,
  ]);

const StakeholderSchema = z
  .object({
    group: z.object({
      label: z.string(),
      title: z.string(),
      values: ValueSchema.array(),
    }),
  })
  .transform((st) => [
    { shortName: st.group.label, title: st.group.title },
    ...st.group.values,
  ]);

export function workbookEntityFromFile() {}

type WorkbookOpts = {
  sections: readonly WorkbookSectionOld[];
};

export type WorkbookOld = WorkbookOpts & {
  findByShortName(shortName: string): WorkbookSectionOld | undefined;
  toJson(): z.infer<typeof WorkbookResponseBodySchema>;
};

export function makeWorkbookOld(opts: WorkbookOpts): WorkbookOld {
  function findByShortName(shortName: string): WorkbookSectionOld | undefined {
    return opts.sections.find((s) => s.shortName === shortName);
  }

  function toJson(): z.infer<typeof WorkbookResponseBodySchema> {
    return WorkbookResponseBodySchema.parse({ sections: opts.sections });
  }

  return deepFreeze({ ...opts, findByShortName, toJson });
}

makeWorkbookOld.fromJson = function fromJson(json: any): WorkbookOld {
  return makeWorkbookOld({
    sections: StakeholderSchema.array().parse(json).flat(2),
  });
};
