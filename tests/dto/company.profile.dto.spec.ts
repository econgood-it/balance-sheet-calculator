import { CompanyProfileSchema } from '../../src/dto/company.profile.dto';

describe('CompanyProfile Dto', () => {
  it('should be created from json', () => {
    const json = {
      name: 'Example GmBH',
      address: 'Examplestreet 1, 89019 City',
      country: 'Germany',
      industrySector: 'Agriculture',
      website: 'https://example.com',
    };
    const compayProfile = CompanyProfileSchema.parse(json);
    expect(compayProfile).toMatchObject(json);
  });

  it('fails on invalid url', () => {
    const json = {
      name: 'Example GmBH',
      address: 'Examplestreet 1, 89019 City',
      country: 'Germany',
      industrySector: 'Agriculture',
      website: 'example.com',
    };
    const result = CompanyProfileSchema.safeParse(json);
    expect(result.success).toBeFalsy();
  });
});
