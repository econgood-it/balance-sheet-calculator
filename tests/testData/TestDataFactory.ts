import mongoose from "mongoose";
import {Environment} from "../../src/environment";
import Region, {IRegion} from "../../src/models/region.model";
import SupplyFraction, {ISupplyFraction} from "../../src/models/supplyFractions.model";
import EmployeesFraction, {IEmployeesFrations} from "../../src/models/employeesFractions.model";
import CompanyFacts, {ICompanyFacts} from "../../src/models/companyFacts.model";
import BalanceSheet, {IBalanceSheet} from "../../src/models/balanceSheet.model";
import Rating, {IRating} from "../../src/models/rating.model";
import {RatingFactory} from "../../src/factories/RatingFactory";

export class TestDataFactory {

    public async createAndSaveBalanceSheet(): Promise<IBalanceSheet> {
        const companyFacts: ICompanyFacts = await new CompanyFacts(this.createDefaultCompanyFacts()).save();
        const rating: IRating = await new Rating(new RatingFactory().createDefaultRating()).save();
        return await new BalanceSheet( {companyFacts: companyFacts._id, rating: rating._id}).save();
    }

    public async createDefaultCompanyFacts(): Promise<ICompanyFacts> {
        const arabEmiratesCode = "ARE";
        const afghanistanCode = "AFG";
        const regions: IRegion[] = [new Region({pppIndex: 2.050108031355940, countryCode: arabEmiratesCode,
            countryName: "United Arab Emirates"}),
            new Region({pppIndex: 3.776326416513620, countryCode: afghanistanCode,
                countryName: "Afghanistan"})];
        for (const region of regions) {
            await new Region(region).save();
        }
        const supplyFractions: ISupplyFraction[] = [new SupplyFraction({countryCode: arabEmiratesCode, costs: 300}),
            new SupplyFraction({countryCode: afghanistanCode, costs: 20})];
        const employeesFractions: IEmployeesFrations[] = [new EmployeesFraction({ countryCode: arabEmiratesCode, percentage: 0.3}),
            new EmployeesFraction({countryCode: afghanistanCode, percentage: 1})];
        return new CompanyFacts( { totalPurchaseFromSuppliers: 0,
            supplyFractions: supplyFractions, employeesFractions: employeesFractions,
            totalStaffCosts: 2345, profit: 238, financialCosts: 473, incomeFromFinancialInvestments: 342,
            additionsToFixedAssets: 234});
    }
}