import deepFreeze from 'deep-freeze';

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
