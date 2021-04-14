import {IndustrySector} from "../../../src/entities/industry.sector";
import {createTranslations, Translations} from "../../../src/entities/Translations";
import {IndustrySectorDtoResponse} from "../../../src/dto/response/industry.sector.response.dto";

describe('IndustrySectorResponseDTO', () => {

  it('is created from industry sector', () => {
    const industrySector = new IndustrySector(undefined, 'A', 1,
      createTranslations('de', 'desc'))
    const industrySectorDtoResponse = IndustrySectorDtoResponse.fromIndustrySector(industrySector, 'de');
    expect(industrySectorDtoResponse).toBeDefined();
    expect(industrySectorDtoResponse).toMatchObject(
      {
        id: undefined,
        industryCode: 'A',
        amountOfTotalTurnover: 1,
        description: 'desc'
      },
    );

  })

  it('is created from industry sector where requested language does not exist', () => {
    const industrySector = new IndustrySector(undefined, 'A', 1,
      {'de': 'Beschreibung'} as Translations);
    const industrySectorDtoResponse = IndustrySectorDtoResponse.fromIndustrySector(industrySector, 'en');
    expect(industrySectorDtoResponse).toBeDefined();
    expect(industrySectorDtoResponse).toMatchObject(
      {
        id: undefined,
        industryCode: 'A',
        amountOfTotalTurnover: 1,
        description: ''
      },
    );
  })

})