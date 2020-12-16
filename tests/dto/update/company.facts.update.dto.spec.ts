
import {CompanyFactsDTOCreate} from "../../../src/dto/create/company.facts.create.dto";
import {CompanyFactsDTOUpdate} from "../../../src/dto/update/company.facts.update.dto";

describe('CompanyFactsUpdateDTO', () => {


    it('is created from json',  () => {
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
            supplyFractions: [],
            employeesFractions: [],
            industrySectors: [],
        }
        const companyFactsDTOUpdate: CompanyFactsDTOUpdate = CompanyFactsDTOUpdate.fromJSON(json);
        expect(companyFactsDTOUpdate).toMatchObject(json);
    })

    describe('is created from json where value is missing for field',  () => {
        let json: any;
        beforeEach(() => {
            json = {
                totalPurchaseFromSuppliers: 1,
                totalStaffCosts: 2,
                profit: 3,
                financialCosts: 4,
                incomeFromFinancialInvestments: 5,
                additionsToFixedAssets: 6,
                turnover: 7,
                totalAssets: 8,
                financialAssetsAndCashBalance: 9,
                supplyFractions: [],
                employeesFractions: [],
                industrySectors: [],
            }
        });

        it('financialAssetsAndCashBalance',  () => {
            delete json.financialAssetsAndCashBalance;
            const companyFactsDTOUpdate: CompanyFactsDTOUpdate = CompanyFactsDTOUpdate.fromJSON(json);
            expect(companyFactsDTOUpdate.financialAssetsAndCashBalance).toBeUndefined();
        })

        it('profit',  () => {
            delete json.profit;
            const companyFactsDTOUpdate: CompanyFactsDTOUpdate = CompanyFactsDTOUpdate.fromJSON(json);
            expect(companyFactsDTOUpdate.profit).toBeUndefined();
        })
    });

})