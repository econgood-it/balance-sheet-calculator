import {GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLObjectType, GraphQLString} from "graphql";
import {SupplyFractionType} from "./SupplyFractionType";
import {EmployeesFractionType} from "./EmployeesFractionType";
import {SupplyFractionInput} from "./SupplyFractionInput";
import {EmployeesFractionInput} from "./EmployeesFractionInput";
import {TopicType} from "./TopicType";

export const TopicInput = new GraphQLInputObjectType({
    name: 'TopicInput',
    fields:  () =>{
        return {
            shortName: {type: GraphQLString},
            estimations: {type: GraphQLFloat},
            weight: {type: GraphQLFloat}
        }
    }
});