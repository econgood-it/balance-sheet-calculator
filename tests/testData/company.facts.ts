import { CompanyFacts } from '../../src/entities/companyFacts';
import { SupplyFraction } from '../../src/entities/supplyFraction';
import { EmployeesFraction } from '../../src/entities/employeesFraction';
import { MainOriginOfOtherSuppliers } from '../../src/entities/main.origin.of.other.suppliers';
import { DEFAULT_COUNTRY_CODE } from '../../src/entities/region';

const arabEmiratesCode = 'ARE';
const afghanistanCode = 'AFG';
const agricultureCode = 'A';
const pharmaceuticCode = 'Ce';

const supplyFractions: SupplyFraction[] = [
  new SupplyFraction(undefined, agricultureCode, arabEmiratesCode, 500),
  new SupplyFraction(undefined, pharmaceuticCode, afghanistanCode, 600),
];
const employeesFractions: EmployeesFraction[] = [
  new EmployeesFraction(undefined, arabEmiratesCode, 0.5),
  new EmployeesFraction(undefined, afghanistanCode, 0.5),
];

export const EmptyCompanyFacts = new CompanyFacts(
  undefined,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  false,
  0,
  false,
  [],
  [],
  [],
  new MainOriginOfOtherSuppliers(undefined, DEFAULT_COUNTRY_CODE, 0)
);

export const EmptyCompanyFactsJson = {
  totalPurchaseFromSuppliers: 0,
  totalStaffCosts: 0,
  profit: 0,
  financialCosts: 0,
  incomeFromFinancialInvestments: 0,
  additionsToFixedAssets: 0,
  turnover: 0,
  totalAssets: 0,
  financialAssetsAndCashBalance: 0,
  numberOfEmployees: 0,
  hasCanteen: false,
  averageJourneyToWorkForStaffInKm: 0,
  isB2B: false,
  supplyFractions: [],
  employeesFractions: [],
  industrySectors: [],
};

export const CompanyFacts1 = new CompanyFacts(
  undefined,
  10000,
  900,
  500,
  600,
  700,
  800,
  0,
  30,
  40,
  0,
  false,
  0,
  false,
  supplyFractions,
  employeesFractions,
  [],
  new MainOriginOfOtherSuppliers(undefined, DEFAULT_COUNTRY_CODE, 0)
);
