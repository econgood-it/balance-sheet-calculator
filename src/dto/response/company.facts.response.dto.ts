import { SupplyFractionDTOResponse } from './supply.fraction.response.dto';
import { EmployeesFractionDTOResponse } from './employees.fraction.response.dto';
import { IndustrySectorDtoResponse } from './industry.sector.response.dto';
import { Translations } from '../../entities/Translations';
import { MainOriginOfOtherSuppliersDTOResponse } from './main.origin.of.other.suppliers.response.dto';
import { CompanyFacts } from '../../models/balance.sheet';
export class CompanyFactsDTOResponse {
  public constructor(
    public readonly totalPurchaseFromSuppliers: number,
    public readonly totalStaffCosts: number,
    public readonly profit: number,
    public readonly financialCosts: number,
    public readonly incomeFromFinancialInvestments: number,
    public readonly additionsToFixedAssets: number,
    public readonly turnover: number,
    public readonly totalAssets: number,
    public readonly financialAssetsAndCashBalance: number,
    public readonly numberOfEmployees: number,
    public readonly hasCanteen: boolean,
    public readonly averageJourneyToWorkForStaffInKm: number,
    public readonly isB2B: boolean,
    public readonly supplyFractions: SupplyFractionDTOResponse[],
    public readonly employeesFractions: EmployeesFractionDTOResponse[],
    public readonly industrySectors: IndustrySectorDtoResponse[],
    public readonly mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliersDTOResponse
  ) {}

  public static fromCompanyFacts(
    companyFacts: CompanyFacts,
    language: keyof Translations
  ): CompanyFactsDTOResponse {
    return new CompanyFactsDTOResponse(
      companyFacts.totalPurchaseFromSuppliers,
      companyFacts.totalStaffCosts,
      companyFacts.profit,
      companyFacts.financialCosts,
      companyFacts.incomeFromFinancialInvestments,
      companyFacts.additionsToFixedAssets,
      companyFacts.turnover,
      companyFacts.totalAssets,
      companyFacts.financialAssetsAndCashBalance,
      companyFacts.numberOfEmployees,
      companyFacts.hasCanteen,
      companyFacts.averageJourneyToWorkForStaffInKm,
      companyFacts.isB2B,
      companyFacts.supplyFractions.map((sf) =>
        SupplyFractionDTOResponse.fromSupplyFraction(sf, language)
      ),
      companyFacts.employeesFractions.map((ef) =>
        EmployeesFractionDTOResponse.fromEmployeesFraction(ef, language)
      ),
      companyFacts.industrySectors.map((is) =>
        IndustrySectorDtoResponse.fromIndustrySector(is)
      ),
      MainOriginOfOtherSuppliersDTOResponse.fromMainOriginOfOtherSuppliers(
        companyFacts.mainOriginOfOtherSuppliers,
        language
      )
    );
  }
}
