import {GraphQLFloat, GraphQLInputObjectType, GraphQLObjectType, GraphQLString} from "graphql";

export const EmployeesFractionInput = new GraphQLInputObjectType({
    name: 'EmployeesFractionInput',
    fields:  () =>{
        return {
            _id: { type: GraphQLString },
            countryCode: { type: GraphQLString },
            percentage: { type: GraphQLFloat },
        }
    }
});