import { z } from 'zod';

const CompanySchema = z.object({
  name: z.string(),
});

const PeriodSchema = z.object({
  start: z.date(),
  end: z.date(),
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
