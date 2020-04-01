import mongoose, {Model, Schema} from "mongoose";

export const EmployeesFrationsSchema= new mongoose.Schema({
    countryCode: { type: String, required: true },
    percentage: { type: Number, required: false }
});

export interface IEmployeesFrations extends mongoose.Document {
    countryCode: string,
    percentage: number,
}

export default mongoose.model<IEmployeesFrations>('EmployeesFrations', EmployeesFrationsSchema);