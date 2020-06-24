import { RegionReader } from "../../src/reader/RegionReader";
import { Region } from "../../src/entities/region";
describe('Stakeholder Weight Calculator', () => {
    it('should calculate supplier and employees risk ratio', async (done) => {
        const regionReader = new RegionReader();
        const regions: Region[] = await regionReader.read('./ecg-excel.xlsx');
        expect(regions).toContainEqual({ "countryCode": 'ABW', "countryName": 'Aruba', 'pppIndex': 1.9628994497935313 });
        done();
    })


})