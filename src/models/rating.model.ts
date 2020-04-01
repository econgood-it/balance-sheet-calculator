import mongoose from "mongoose";
import {ITopic, TopicSchema} from "./topic.model";

export const RatingSchema= new mongoose.Schema({
    topics: [TopicSchema],
});

export interface IRating extends mongoose.Document {
    topics: ITopic[]
}

export default mongoose.model<IRating>('Rating', RatingSchema);