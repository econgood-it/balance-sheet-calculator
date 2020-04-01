import {GraphQLFloat, GraphQLObjectType, GraphQLList, GraphQLString} from "graphql";
import {SupplyFractionType} from "./SupplyFractionType";
import {EmployeesFractionType} from "./EmployeesFractionType";
export const CompanyFactsType = new GraphQLObjectType({
    name: 'CompanyFactsType',
    fields:  () =>{
        return {
            _id: {type: GraphQLString},
            profit: {type: GraphQLFloat},
            totalStaffCosts: {type: GraphQLFloat},
            financialCosts: {type: GraphQLFloat},
            totalPurchaseFromSuppliers: {type: GraphQLFloat},
            incomeFromFinancialInvestments: {type: GraphQLFloat},
            additionsToFixedAssets: {type: GraphQLFloat},
            supplyFractions: {type: new GraphQLList(SupplyFractionType)},
            employeesFractions: {type: new GraphQLList(EmployeesFractionType)}
        }
    }
});