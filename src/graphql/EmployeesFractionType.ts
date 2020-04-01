import {GraphQLFloat, GraphQLObjectType, GraphQLString} from "graphql";

export const EmployeesFractionType = new GraphQLObjectType({
    name: 'EmployeesFractionType',
    fields:  () =>{
        return {
            _id: { type: GraphQLString },
            countryCode: { type: GraphQLString },
            percentage: { type: GraphQLFloat }
        }
    }
});