import {GraphQLFloat, GraphQLInputObjectType, GraphQLObjectType, GraphQLString} from "graphql";

export const SupplyFractionInput = new GraphQLInputObjectType({
    name: 'SupplyFractionInput',
    fields:  () =>{
        return {
            countryCode: { type: GraphQLString },
            costs: { type: GraphQLFloat },
        }
    }
});