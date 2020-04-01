import {GraphQLFloat, GraphQLObjectType, GraphQLList, GraphQLString} from "graphql";
export const TopicType = new GraphQLObjectType({
    name: 'TopicType',
    fields:  () =>{
        return {
            _id: {type: GraphQLString},
            shortName: {type: GraphQLString},
            name: {type: GraphQLString},
            estimations: {type: GraphQLFloat},
            points: {type: GraphQLFloat},
            maxPoints: {type: GraphQLFloat},
            weight: {type: GraphQLFloat}
        }
    }
});