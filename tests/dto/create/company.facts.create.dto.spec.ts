import {IndustrySectorCreateDtoCreate} from "../../../src/dto/create/industry.sector.create.dto";
import {CompanyFactsDTOCreate} from "../../../src/dto/create/company.facts.create.dto";

describe('CompanyFactsCreateDTO', () => {


    it('is created from json and returns a CompanyFacts entity',  () => {
        const json = {
            totalPurchaseFromSuppliers: 1,
            totalStaffCosts: 2,
            profit: 3,
            financialCosts: 4,
            incomeFromFinancialInvestments: 5,
            additionsToFixedAssets: 6,
            turnover: 7,
            totalAssets: 8,
            financialAssetsAndCashBalance: 9,
            totalSales: 10,
            supplyFractions: [],
            employeesFractions: [],
            industrySectors: [],
        }
        const companyFactsDTOCreate: CompanyFactsDTOCreate = CompanyFactsDTOCreate.fromJSON(json);
        const result = companyFactsDTOCreate.toCompanyFacts();
        expect(result).toMatchObject(json);
    })

})