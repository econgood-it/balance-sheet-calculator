import mongoose from "mongoose";

export const RegionSchema= new mongoose.Schema({
    pppIndex: { type: Number, required: true },
    countryCode: { type: String, required: true },
    countryName: { type: String, required: false }
});

export interface IRegion extends mongoose.Document {
    pppIndex: number,
    countryCode: string,
    countryName: string
}

export default mongoose.model<IRegion>('Region', RegionSchema);