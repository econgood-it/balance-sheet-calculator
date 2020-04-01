import {GraphQLObjectType, GraphQLList, GraphQLString } from "graphql";
import {CompanyFactsType} from "./CompanyFactsType";
import CompanyFacts from "../models/companyFacts.model";
export const CompanyFactsQuery = new GraphQLObjectType({
    name: 'CompanyFactsQuery',
    fields:  () => {
        return {
            companyFacts: {
                type: CompanyFactsType,
                args: {
                    id: { type: GraphQLString },
                },
                resolve: async (root, args) => {
                    console.log(args.id)
                    const companyFacts = await CompanyFacts.findById(args.id)
                    if (!companyFacts) {
                        throw new Error('error while fetching data')
                    }
                    return companyFacts
                }
            },
            allCompanyFacts: {
                type: new GraphQLList(CompanyFactsType),
                resolve: async () => {
                    const companyFacts = await CompanyFacts.find()
                    if (!companyFacts) {
                        throw new Error('error while fetching data')
                    }
                    return companyFacts
                }
            }
        }
    }
});