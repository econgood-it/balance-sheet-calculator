import {
  makeCompany,
  makeContactPerson,
  makeGeneralInformation,
  makePeriod,
} from '../../src/models/general.information';

export const generalInformationDummyJson = {
  contactPerson: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  company: {
    name: 'Test Company',
  },
  period: {
    start: new Date('2025-01-01').toISOString(),
    end: new Date('2026-01-01').toISOString(),
  },
};

export const generalInformationDummy = makeGeneralInformation({
  contactPerson: makeContactPerson(generalInformationDummyJson.contactPerson),
  company: makeCompany(generalInformationDummyJson.company),
  period: makePeriod({
    start: new Date(generalInformationDummyJson.period.start),
    end: new Date(generalInformationDummyJson.period.end),
  }),
});
