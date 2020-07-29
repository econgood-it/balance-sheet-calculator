import { RegionReader } from "../../src/reader/RegionReader";
import { Region } from "../../src/entities/region";
describe('Stakeholder Weight Calculator', () => {
    it('should calculate supplier and employees risk ratio', async (done) => {
        const regionReader = new RegionReader();
        const regions: Region[] = await regionReader.read('./regions.csv');
        expect(regions).toContainEqual({ "countryCode": 'ABW', "countryName": 'Aruba', 'pppIndex': 1.9628994497935313 });
        expect(regions).toContainEqual({ "countryCode": 'ISL', "countryName": 'Iceland', 'pppIndex': 0.8592191515177231 })
        expect(regions).toContainEqual({ "countryCode": 'ZWE', "countryName": 'Zimbabwe', 'pppIndex': 3.0325616327831186 });
        done();
    })


})