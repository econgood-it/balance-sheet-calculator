import {IndustrySectorCreateDtoCreate} from "../../src/dto/create/industry.sector.create.dto";

describe('Industry Sector DTO', () => {

    it('should create DTO and return industry Sector entity',  () => {
        const industrySectorCreateDtoCreate: IndustrySectorCreateDtoCreate = IndustrySectorCreateDtoCreate.fromJSON(
          {"industryCode": "A", "amountOfTotalTurnover": 3.44, "description": "My description"});
        const result = industrySectorCreateDtoCreate.toIndustrySector();
        expect(result.industryCode).toBe('A');
        expect(result.amountOfTotalTurnover).toBe(3.44);
        expect(result.description).toBe('My description');
    })

})