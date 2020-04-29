import {GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLObjectType, GraphQLString} from "graphql";
import {SupplyFractionType} from "./SupplyFractionType";
import {EmployeesFractionType} from "./EmployeesFractionType";
import {SupplyFractionInput} from "./SupplyFractionInput";
import {EmployeesFractionInput} from "./EmployeesFractionInput";
import {TopicType} from "./TopicType";
import {TopicInput} from "./TopicInput";

export const RatingInput = new GraphQLInputObjectType({
    name: 'RatingInput',
    fields:  () =>{
        return {
            topics: {type: new GraphQLList(TopicInput)},
        }
    }
});