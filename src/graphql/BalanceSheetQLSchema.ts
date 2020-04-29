import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { BalanceSheetQuery} from "./BalanceSheetQuery";
var mutation = require('./BalanceSheetMutation');

export const BalanceSheetQLSchema = new GraphQLSchema({
    query: BalanceSheetQuery,
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutation
    })
})