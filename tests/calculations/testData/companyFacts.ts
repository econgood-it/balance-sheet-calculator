import { CompanyFacts } from "../../../src/entities/companyFacts";
import { SupplyFraction } from "../../../src/entities/supplyFraction";
import { EmployeesFraction } from "../../../src/entities/employeesFraction";

const arabEmiratesCode = "ARE";
const afghanistanCode = "AFG";
const supplyFractions: SupplyFraction[] = [
    new SupplyFraction(undefined, arabEmiratesCode, 500),
    new SupplyFraction(undefined, afghanistanCode, 600)
];
const employeesFractions: EmployeesFraction[] = [
    new EmployeesFraction(undefined, arabEmiratesCode, 0.5),
    new EmployeesFraction(undefined, afghanistanCode, 0.5)
];

export const CompanyFacts0 = new CompanyFacts(undefined, 0, 0, 0, 0, 0, 0,
    [], [])

export const CompanyFacts1 = new CompanyFacts(undefined, 10000, 900, 500, 600, 700, 800,
    supplyFractions, employeesFractions)