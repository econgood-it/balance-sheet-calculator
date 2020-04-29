import {GraphQLFloat, GraphQLInputObjectType, GraphQLObjectType, GraphQLString} from "graphql";

export const EmployeesFractionInput = new GraphQLInputObjectType({
    name: 'EmployeesFractionInput',
    fields:  () =>{
        return {
            countryCode: { type: GraphQLString },
            percentage: { type: GraphQLFloat },
        }
    }
});