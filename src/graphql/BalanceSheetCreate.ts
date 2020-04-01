import {GraphQLList, GraphQLFloat} from "graphql";
import CompanyFacts, {ICompanyFacts} from "../models/companyFacts.model";
import BalanceSheet, {IBalanceSheet} from "../models/balanceSheet.model";
import {SupplyFractionInput} from "./SupplyFractionInput";
import {BalanceSheetType} from "./BalanceSheetType";
import {EmployeesFractionInput} from "./EmployeesFractionInput";
import Rating, {IRating} from "../models/rating.model";
import {RatingFactory} from "../factories/RatingFactory";

export const BalanceSheetCreate = {
    type: BalanceSheetType,
    args: {
        profit: { type: GraphQLFloat },
        totalStaffCosts: {type: GraphQLFloat},
        financialCosts: {type: GraphQLFloat},
        totalPurchaseFromSuppliers: {type: GraphQLFloat},
        incomeFromFinancialInvestments: {type: GraphQLFloat},
        additionsToFixedAssets: {type: GraphQLFloat},
        supplyFractions: { type: new GraphQLList(SupplyFractionInput) },
        employeesFractions: { type: new GraphQLList(EmployeesFractionInput) },
    },
    resolve: async (root: any, args: any) => {
        const companyFactsInput: any = {};
        Object.keys(args).forEach(e => {
            if (args[e] !== undefined) {
                companyFactsInput[e] = args[e];
            }
        });
        const companyFacts: ICompanyFacts = await new CompanyFacts(companyFactsInput).save();
        const rating: IRating = await new Rating(new RatingFactory().createDefaultRating()).save();
        const balanceSheet: IBalanceSheet = await new BalanceSheet(
            {companyFacts: companyFacts._id, rating: rating._id}).save();
        return await balanceSheet.populate('companyFacts').populate('rating').execPopulate();
    }};