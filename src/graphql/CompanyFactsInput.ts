import {GraphQLFloat, GraphQLInputObjectType, GraphQLList, GraphQLObjectType, GraphQLString} from "graphql";
import {SupplyFractionType} from "./SupplyFractionType";
import {EmployeesFractionType} from "./EmployeesFractionType";
import {SupplyFractionInput} from "./SupplyFractionInput";
import {EmployeesFractionInput} from "./EmployeesFractionInput";

export const CompanyFactsInput = new GraphQLInputObjectType({
    name: 'CompanyFactsInput',
    fields:  () =>{
        return {
            profit: {type: GraphQLFloat},
            totalStaffCosts: {type: GraphQLFloat},
            financialCosts: {type: GraphQLFloat},
            totalPurchaseFromSuppliers: {type: GraphQLFloat},
            incomeFromFinancialInvestments: {type: GraphQLFloat},
            additionsToFixedAssets: {type: GraphQLFloat},
            supplyFractions: {type: new GraphQLList(SupplyFractionInput)},
            employeesFractions: {type: new GraphQLList(EmployeesFractionInput)}
        }
    }
});