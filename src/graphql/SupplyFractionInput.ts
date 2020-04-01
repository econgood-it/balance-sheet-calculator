import {GraphQLFloat, GraphQLInputObjectType, GraphQLObjectType, GraphQLString} from "graphql";

export const SupplyFractionInput = new GraphQLInputObjectType({
    name: 'SupplyFractionInput',
    fields:  () =>{
        return {
            _id: { type: GraphQLString },
            countryCode: { type: GraphQLString },
            costs: { type: GraphQLFloat },
        }
    }
});