import deepFreeze from 'deep-freeze';
import { z } from 'zod';
import { GeneralInformationSchema } from '@ecogood/e-calculator-schemas/dist/general.information.dto';
import { CompanyFactsResponseBodySchema } from '../../../e-calculator-schemas/src/company.facts.dto';
import { RatingRequestBodySchema } from '../../../e-calculator-schemas/src/rating.dto';

type PeriodOpts = {
  start: Date;
  end: Date;
};

export type Period = PeriodOpts & {};

export function makePeriod(data: PeriodOpts): Period {
  return deepFreeze({ ...data });
}

type CompanyOpts = {
  name: string;
};

export type Company = CompanyOpts & {};

export function makeCompany(data: CompanyOpts): Company {
  return deepFreeze({ ...data });
}

type ContactPersonOpts = {
  name: string;
  email: string;
};

export type ContactPerson = ContactPersonOpts & {};

export function makeContactPerson(data: ContactPerson): ContactPerson {
  return deepFreeze({ ...data });
}

type GeneralInformationOpts = {
  contactPerson: ContactPerson;
  company: Company;
  period?: Period;
};

export type GeneralInformation = GeneralInformationOpts & {
  toJson: () => z.infer<typeof GeneralInformationSchema>;
};

export function makeGeneralInformation(
  data: GeneralInformationOpts
): GeneralInformation {
  function toJson(): z.infer<typeof GeneralInformationSchema> {
    return GeneralInformationSchema.parse({
      ...data,
      period: data.period
        ? {
            start: data.period.start.toISOString(),
            end: data.period.end.toISOString(),
          }
        : undefined,
    });
  }

  return deepFreeze({ ...data, toJson });
}

makeGeneralInformation.fromJson = function fromJson(
  json: z.input<typeof GeneralInformationSchema>
): GeneralInformation {
  const generalInformation = GeneralInformationSchema.parse(json);
  const contactPerson = makeContactPerson(generalInformation.contactPerson);
  const company = makeCompany(generalInformation.company);
  const period = generalInformation.period
    ? makePeriod({
        start: new Date(generalInformation.period.start),
        end: new Date(generalInformation.period.end),
      })
    : undefined;
  return makeGeneralInformation({ contactPerson, company, period });
};
