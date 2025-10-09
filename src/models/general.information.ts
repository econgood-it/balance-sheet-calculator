import deepFreeze from 'deep-freeze';
import { z } from 'zod';
import { GeneralInformationSchema } from '@ecogood/e-calculator-schemas/dist/general.information.dto';

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

export type GeneralInformation = GeneralInformationOpts & {};

export function makeGeneralInformation(
  data: GeneralInformationOpts
): GeneralInformation {
  return deepFreeze({ ...data });
}

makeGeneralInformation.fromJson = function fromJson(
  json: z.input<typeof GeneralInformationSchema>
): GeneralInformation {
  const generalInformation = GeneralInformationSchema.parse(json);
  const contactPerson = makeContactPerson(generalInformation.contactPerson);
  const company = makeCompany(generalInformation.company);
  const period = generalInformation.period
    ? makePeriod(generalInformation.period)
    : undefined;
  return makeGeneralInformation({ contactPerson, company, period });
};
