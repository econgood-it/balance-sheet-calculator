import {IndustryReader} from "../../src/reader/industry.reader";
import {Industry} from "../../src/entities/industry";

describe('Industry Reader', () => {
    it('should read industry.csv', async (done) => {
        const regionReader = new IndustryReader();
        const industries: Industry[] = await regionReader.read();

        expect(industries).toContainEqual({ "industryCode": 'A', 'ecologicalSupplyChainRisk': 2, 'id': undefined});
        expect(industries).toContainEqual({ "industryCode": 'Ce', 'ecologicalSupplyChainRisk': 1.5, 'id': undefined});
        // expect(regions).toContainEqual({ "countryCode": 'ZWE', "countryName": 'Zimbabwe', 'pppIndex': 3.0325616327831186 });
        done();
    })


})