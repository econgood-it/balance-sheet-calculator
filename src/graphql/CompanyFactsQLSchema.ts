import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { CompanyFactsQuery} from "./CompanyFactsQuery";
var mutation = require('./CompanyFactsMutation')

export const CompanyFactsQLSchema = new GraphQLSchema({
    query: CompanyFactsQuery,
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutation
    })
})