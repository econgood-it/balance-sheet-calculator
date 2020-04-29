import {GraphQLObjectType, GraphQLList, GraphQLString } from "graphql";
import BalanceSheet from "../models/balanceSheet.model";
import {BalanceSheetType} from "./BalanceSheetType";
export const BalanceSheetQuery = new GraphQLObjectType({
    name: 'BalanceSheetQuery',
    fields:  () => {
        return {
            balanceSheet: {
                type: BalanceSheetType,
                args: {
                    id: { type: GraphQLString },
                },
                resolve: async (root, args) => {
                    const balanceSheet = await BalanceSheet.findById(args.id);
                    if (!balanceSheet) {
                        throw new Error('error while fetching data');
                    }
                    return balanceSheet;
                }
            },
            allBalanceSheets: {
                type: new GraphQLList(BalanceSheetType),
                resolve: async () => {
                    const balanceSheet = await BalanceSheet.find();
                    if (!balanceSheet) {
                        throw new Error('error while fetching data');
                    }
                    return balanceSheet;
                }
            }
        }
    }
});