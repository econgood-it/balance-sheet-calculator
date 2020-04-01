import mongoose, {Schema} from "mongoose";
import {ICompanyFacts} from "./companyFacts.model";
import {IRating} from "./rating.model";

const BalanceSheetSchema = new mongoose.Schema({
    companyFacts: { type: Schema.Types.ObjectId, ref: 'CompanyFacts' },
    rating: { type: Schema.Types.ObjectId, ref: 'Rating' }
});

export interface IBalanceSheet extends mongoose.Document {
    companyFacts: ICompanyFacts['_id'],
    rating: IRating['_id']
}

export default mongoose.model<IBalanceSheet>('BalanceSheet', BalanceSheetSchema);