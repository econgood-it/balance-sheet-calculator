import mongoose, {Model, Schema} from "mongoose";

export const SupplyFractionSchema= new mongoose.Schema({
    countryCode: { type: String, required: true },
    costs: { type: Number, required: false }
});

export interface ISupplyFraction extends mongoose.Document {
    countryCode: string,
    costs: number,
}

export default mongoose.model<ISupplyFraction>('SupplyFraction', SupplyFractionSchema);