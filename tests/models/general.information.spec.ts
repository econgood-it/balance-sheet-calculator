import {
  makeCompany,
  makeContactPerson,
  makeGeneralInformation,
  makePeriod,
} from '../../src/models/general.information';

describe('GeneralInformation', () => {
  const start = new Date(Date.now());
  it('should be created', () => {
    const period = makePeriod({
      start,
      end: new Date(start.setFullYear(start.getFullYear() + 1)),
    });
    const contactPerson = makeContactPerson({
      email: 'test@example.com',
      name: 'John Doe',
    });
    const company = makeCompany({
      name: 'Test Company',
    });
    const generalInformation = makeGeneralInformation({
      contactPerson,
      company,
      period,
    });
    expect(generalInformation).toMatchObject({
      contactPerson,
      company,
      period,
    });
  });
});
