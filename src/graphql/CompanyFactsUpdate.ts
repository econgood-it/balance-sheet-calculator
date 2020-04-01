import {GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLFloat} from "graphql";
import {CompanyFactsType} from "./CompanyFactsType";
import CompanyFacts, {ICompanyFacts} from "../models/companyFacts.model";
import BalanceSheet, {IBalanceSheet} from "../models/balanceSheet.model";
import {SupplyFractionInput} from "./SupplyFractionInput";
export const CompanyFactsUpdate = {
    type: CompanyFactsType,
    args: {
        balanceSheetId: { type: new GraphQLNonNull(GraphQLString) },
        profit: { type: GraphQLFloat },
        totalStaffCosts: { type: GraphQLFloat },
        supplyFractions: { type: new GraphQLList(SupplyFractionInput) },
    },
    resolve: async (root: any, args: any) => {
        const balanceSheet: IBalanceSheet | null = await BalanceSheet.findById(args.balanceSheetId).lean();
        if (!balanceSheet) {
            throw new Error('Cannot find balance sheet with id ' + args.balanceSheetId)
        }
        const update: any = {};
        Object.keys(args).forEach(e => {
            if (e !== 'balanceSheetId' && args[e] !== undefined) {
                update[e] = args[e];
            }
        });
        const companyFacts = await CompanyFacts.findByIdAndUpdate(balanceSheet.companyFacts,
                                    update,
            { upsert: false, new: true });
        if (!companyFacts) {
            throw new Error('Cannot find and update company facts with id ' +
                balanceSheet.companyFacts)
        }
        return companyFacts
    }};