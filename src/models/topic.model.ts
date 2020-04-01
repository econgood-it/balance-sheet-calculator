import mongoose from "mongoose";
import {ISupplyFraction, SupplyFractionSchema} from "./supplyFractions.model";


export const TopicSchema= new mongoose.Schema({
    shortName: { type: String, required: true },
    name: { type: String, required: true },
    estimations: { type: Number, required: false },
    points: { type: Number, required: false },
    maxPoints: { type: Number, required: false },
    weight: { type: Number, required: false }
});

export interface ITopic extends mongoose.Document {
    shortName: string,
    name: string,
    estimations: number,
    points: number,
    maxPoints: number,
    weight: number
}

export default mongoose.model<ITopic>('Topic', TopicSchema);