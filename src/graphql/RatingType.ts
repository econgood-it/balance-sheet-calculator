import {GraphQLObjectType, GraphQLList, GraphQLString} from "graphql";
import {TopicType} from "./TopicType";
export const RatingType = new GraphQLObjectType({
    name: 'RatingType',
    fields:  () =>{
        return {
            _id: {type: GraphQLString},
            topics: {type: new GraphQLList(TopicType)},
        }
    }
});