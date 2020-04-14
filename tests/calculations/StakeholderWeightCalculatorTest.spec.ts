import {StakeholderWeightCalculator} from "../../src/calculations/StakeholderWeightCalculator";
import Region, {IRegion} from "../../src/models/region.model";
import SupplyFraction, {ISupplyFraction} from "../../src/models/supplyFractions.model";
import EmployeesFraction, {IEmployeesFrations} from "../../src/models/employeesFractions.model";
import CompanyFacts, {ICompanyFacts} from "../../src/models/companyFacts.model";
import mongoose from "mongoose";
import {Environment} from "../../src/environment";

describe('Movies API', () => {

    let companyFacts: ICompanyFacts;

    beforeAll(async (done) => {
        mongoose.Promise = global.Promise;
        const environment = new Environment();
        mongoose.connect(environment.dbUrl, {
            useNewUrlParser: true,
            useFindAndModify: false
        });
        const arabEmiratesCode = "ARE";
        const afghanistanCode = "AFG";
        const regions: IRegion[] = [new Region({pppIndex: 2.050108031355940, countryCode: arabEmiratesCode,
                                        countryName: "United Arab Emirates"}),
                                    new Region({pppIndex: 3.776326416513620, countryCode: afghanistanCode,
                                        countryName: "Afghanistan"})];
        for (const region of regions) {
            const r = await new Region(region).save();
        }
        const supplyFractions: ISupplyFraction[] = [new SupplyFraction({countryCode: arabEmiratesCode, costs: 300}),
            new SupplyFraction({countryCode: afghanistanCode, costs: 20})];
        const employeesFractions: IEmployeesFrations[] = [new EmployeesFraction({ countryCode: arabEmiratesCode, percentage: 0.3}),
            new EmployeesFraction({countryCode: afghanistanCode, percentage: 1})];
        companyFacts = new CompanyFacts( { totalPurchaseFromSuppliers: 0,
            supplyFractions: supplyFractions, employeesFractions: employeesFractions,
            totalStaffCosts: 2345, profit: 238, financialCosts: 473, incomeFromFinancialInvestments: 342,
            additionsToFixedAssets: 234});
        done();
    });

    it('should create a new movie', async (done) => {
        const stakeholderWeightCalculator = new StakeholderWeightCalculator(companyFacts);
        const result = await stakeholderWeightCalculator.calculateSupplierAndEmployeesRiskRatio();
        expect(result).toBeCloseTo(17.8789386768471, 13);
        done();
    })

    afterAll(async () => {
        const countryCodes = ["ARE", "AFG"];
        for (const c of countryCodes) {
            await Region.findOneAndDelete({countryCode: c})
        };
        try {
            // Connection to Mongo killed
            await mongoose.disconnect();
        } catch (error) {
            console.log(`You did something wrong dummy!${error}`);
            throw error;
        }
    })
})