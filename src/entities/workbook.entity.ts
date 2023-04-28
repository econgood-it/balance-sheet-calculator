import { z } from 'zod';
import {
  SectionSchema,
  WorkbookResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/workbook.dto';

type Section = z.infer<typeof SectionSchema>;
type Workbook = z.infer<typeof WorkbookResponseBodySchema>;
interface IWorkbookEntity {
  findByShortName(shortName: string): Section | undefined;
  toJson(): Workbook;
}

export class WorkbookEntity implements IWorkbookEntity {
  constructor(private sections: Section[]) {}

  findByShortName(shortName: string): Section | undefined {
    return this.sections.find((s) => s.shortName === shortName);
  }

  toJson(): Workbook {
    return WorkbookResponseBodySchema.parse({ sections: this.sections });
  }
}
