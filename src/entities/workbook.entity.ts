import { z } from 'zod';
import {
  SectionSchema,
  WorkbookResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/workbook.dto';

export type WorkbookSection = z.infer<typeof SectionSchema>;
type Workbook = z.infer<typeof WorkbookResponseBodySchema>;
interface IWorkbookEntity {
  findByShortName(shortName: string): WorkbookSection | undefined;
  toJson(): Workbook;
}

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

export class WorkbookEntity implements IWorkbookEntity {
  constructor(private sections: WorkbookSection[]) {}

  static fromJson(json: any): WorkbookEntity {
    const stakeholders = StakeholderSchema.array().parse(json).flat(2);
    return new WorkbookEntity(stakeholders);
  }

  findByShortName(shortName: string): WorkbookSection | undefined {
    return this.sections.find((s) => s.shortName === shortName);
  }

  toJson(): Workbook {
    return WorkbookResponseBodySchema.parse({ sections: this.sections });
  }
}
