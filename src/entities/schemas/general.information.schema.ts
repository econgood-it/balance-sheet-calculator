import { z } from 'zod';

const CompanySchema = z.object({
  name: z.string(),
});
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const IsoDateString = z.string().regex(isoDateRegex, 'Invalid ISO date format');

const PeriodSchema = z.object({
  start: IsoDateString,
  end: IsoDateString,
});

const ContactPersonSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

export const GeneralInformationDBSchema = z.object({
  company: CompanySchema,
  contactPerson: ContactPersonSchema,
  period: PeriodSchema.optional(),
});
