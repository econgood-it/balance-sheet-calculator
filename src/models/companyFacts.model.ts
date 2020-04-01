import mongoose, {Schema, Types } from "mongoose";
import {ISupplyFraction,  SupplyFractionSchema} from "./supplyFractions.model";
import {EmployeesFrationsSchema, IEmployeesFrations} from "./employeesFractions.model";


const CompanyFactsSchema= new mongoose.Schema({
    totalPurchaseFromSuppliers: Number,
    totalStaffCosts: Number,
    profit: Number,
    financialCosts: Number,
    incomeFromFinancialInvestments: Number,
    additionsToFixedAssets: Number,
    supplyFractions: [SupplyFractionSchema],
    employeesFractions: [EmployeesFrationsSchema]
});

export interface ICompanyFacts extends mongoose.Document {
    totalPurchaseFromSuppliers: number,
    totalStaffCosts: number,
    profit: number,
    financialCosts: number,
    incomeFromFinancialInvestments: number,
    additionsToFixedAssets: number,
    supplyFractions: ISupplyFraction[],
    employeesFractions: IEmployeesFrations[]
}

export default mongoose.model<ICompanyFacts>('CompanyFacts', CompanyFactsSchema);
