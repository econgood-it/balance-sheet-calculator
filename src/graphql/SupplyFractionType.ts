import {GraphQLFloat, GraphQLObjectType, GraphQLString} from "graphql";

export const SupplyFractionType = new GraphQLObjectType({
    name: 'SupplyFractionType',
    fields:  () =>{
        return {
            _id: { type: GraphQLString },
            countryCode: { type: GraphQLString },
            costs: { type: GraphQLFloat }
        }
    }
});