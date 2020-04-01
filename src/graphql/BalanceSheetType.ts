import {GraphQLFloat, GraphQLObjectType, GraphQLList, GraphQLString} from "graphql";
import {SupplyFractionType} from "./SupplyFractionType";
import {CompanyFactsType} from "./CompanyFactsType";
import {RatingType} from "./RatingType";
export const BalanceSheetType = new GraphQLObjectType({
    name: 'BalanceSheetType',
    fields:  () =>{
        return {
            _id: {type: GraphQLString},
            companyFacts: {type: CompanyFactsType},
            rating: {type: RatingType}
        }
    }
});