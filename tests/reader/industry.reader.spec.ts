import {IndustryReader} from "../../src/reader/industry.reader";
import {Industry} from "../../src/entities/industry";

describe('Industry Reader', () => {

    it('should read industry.csv', async (done) => {
        const regionReader = new IndustryReader();
        const industries: Industry[] = await regionReader.read();

        expect(industries).toContainEqual({ "industryCode": 'A', 'ecologicalSupplyChainRisk': 2,
            'ecologicalDesignOfProductsAndServices': 1, 'id': undefined});
        expect(industries).toContainEqual({ "industryCode": 'Ce', 'ecologicalSupplyChainRisk': 1.5,
            'ecologicalDesignOfProductsAndServices': 1.5, 'id': undefined});
        done();
    })


})