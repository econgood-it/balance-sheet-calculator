import { BalanceSheetDTOUpdate } from '../dto/update/balance.sheet.update.dto';
import { BalanceSheet } from '../entities/balanceSheet';
import { CompanyFacts } from '../entities/companyFacts';
import { CompanyFactsDTOUpdate } from '../dto/update/company.facts.update.dto';
import { SupplyFractionDTOUpdate } from '../dto/update/supply.fraction.update.dto';
import { Repository } from 'typeorm';
import { SupplyFraction } from '../entities/supplyFraction';
import { EmployeesFraction } from '../entities/employeesFraction';
import { EmployeesFractionDTOUpdate } from '../dto/update/employees.fraction.update.dto';
import { IndustrySectorDtoUpdate } from '../dto/update/industry.sector.update.dto';
import { IndustrySector } from '../entities/industry.sector';
import {
  createTranslations,
  Translations,
  updateTranslationOfLanguage,
} from '../entities/Translations';
import { RatingWithDtoMerger } from './rating.with.dto.merger';
import { mergeVal } from './merge.utils';

export class EntityWithDtoMerger {
  private ratingWithDtoMerger: RatingWithDtoMerger = new RatingWithDtoMerger();
  public constructor(
    private supplyFractionRepository: Repository<SupplyFraction>,
    private employeesFractionRepository: Repository<EmployeesFraction>,
    private industrySectorRepository: Repository<IndustrySector>
  ) {}

  public async mergeBalanceSheet(
    balanceSheet: BalanceSheet,
    balanceSheetDTOUpdate: BalanceSheetDTOUpdate,
    language: keyof Translations
  ): Promise<void> {
    if (balanceSheetDTOUpdate.companyFacts) {
      await this.mergeCompanyFacts(
        balanceSheet.companyFacts,
        balanceSheetDTOUpdate.companyFacts,
        language
      );
    }
    if (balanceSheetDTOUpdate.rating) {
      this.ratingWithDtoMerger.mergeRating(
        balanceSheet.rating,
        balanceSheetDTOUpdate.rating,
        balanceSheet.type
      );
    }
  }

  public async mergeCompanyFacts(
    companyFacts: CompanyFacts,
    companyFactsDTOUpdate: CompanyFactsDTOUpdate,
    language: keyof Translations
  ): Promise<void> {
    companyFacts.totalPurchaseFromSuppliers = mergeVal(
      companyFacts.totalPurchaseFromSuppliers,
      companyFactsDTOUpdate.totalPurchaseFromSuppliers
    );
    companyFacts.totalStaffCosts = mergeVal(
      companyFacts.totalStaffCosts,
      companyFactsDTOUpdate.totalStaffCosts
    );
    companyFacts.profit = mergeVal(
      companyFacts.profit,
      companyFactsDTOUpdate.profit
    );
    companyFacts.financialCosts = mergeVal(
      companyFacts.financialCosts,
      companyFactsDTOUpdate.financialCosts
    );
    companyFacts.incomeFromFinancialInvestments = mergeVal(
      companyFacts.incomeFromFinancialInvestments,
      companyFactsDTOUpdate.incomeFromFinancialInvestments
    );
    companyFacts.additionsToFixedAssets = mergeVal(
      companyFacts.additionsToFixedAssets,
      companyFactsDTOUpdate.additionsToFixedAssets
    );
    companyFacts.turnover = mergeVal(
      companyFacts.turnover,
      companyFactsDTOUpdate.turnover
    );
    companyFacts.totalAssets = mergeVal(
      companyFacts.totalAssets,
      companyFactsDTOUpdate.totalAssets
    );
    companyFacts.financialAssetsAndCashBalance = mergeVal(
      companyFacts.financialAssetsAndCashBalance,
      companyFactsDTOUpdate.financialAssetsAndCashBalance
    );
    companyFacts.numberOfEmployees = mergeVal(
      companyFacts.numberOfEmployees,
      companyFactsDTOUpdate.numberOfEmployees
    );
    companyFacts.hasCanteen = mergeVal(
      companyFacts.hasCanteen,
      companyFactsDTOUpdate.hasCanteen
    );
    companyFacts.averageJourneyToWorkForStaffInKm = mergeVal(
      companyFacts.averageJourneyToWorkForStaffInKm,
      companyFactsDTOUpdate.averageJourneyToWorkForStaffInKm
    );
    companyFacts.isB2B = mergeVal(
      companyFacts.isB2B,
      companyFactsDTOUpdate.isB2B
    );
    if (companyFactsDTOUpdate.industrySectors) {
      await this.replaceIndustrySectors(
        companyFacts,
        companyFactsDTOUpdate.industrySectors,
        language
      );
    }
    if (companyFactsDTOUpdate.supplyFractions) {
      await this.replaceSupplyFractions(
        companyFacts,
        companyFactsDTOUpdate.supplyFractions
      );
    }
    if (companyFactsDTOUpdate.employeesFractions) {
      await this.replaceEmployeesFractions(
        companyFacts,
        companyFactsDTOUpdate.employeesFractions
      );
    }
  }

  public async replaceIndustrySectors(
    companyFacts: CompanyFacts,
    industrySectorDTOUpdates: IndustrySectorDtoUpdate[],
    language: keyof Translations
  ): Promise<void> {
    const industrySectors: IndustrySector[] = [];
    for (const industrySectorDTOUpdate of industrySectorDTOUpdates) {
      const industrySector = companyFacts.industrySectors.find(
        (is) => is.industryCode === industrySectorDTOUpdate.industryCode
      );
      const description = industrySector
        ? updateTranslationOfLanguage(
            industrySector.description,
            language,
            industrySectorDTOUpdate.description
          )
        : createTranslations(language, industrySectorDTOUpdate.description);

      industrySectors.push(
        new IndustrySector(
          undefined,
          industrySectorDTOUpdate.industryCode,
          industrySectorDTOUpdate.amountOfTotalTurnover,
          description
        )
      );
    }
    await this.industrySectorRepository.remove(companyFacts.industrySectors);
    companyFacts.industrySectors = industrySectors;
  }

  public async replaceSupplyFractions(
    companyFacts: CompanyFacts,
    supplyFractionDTOUpdates: SupplyFractionDTOUpdate[]
  ): Promise<void> {
    await this.supplyFractionRepository.remove(companyFacts.supplyFractions);
    companyFacts.supplyFractions = supplyFractionDTOUpdates.map(
      (sf) =>
        new SupplyFraction(undefined, sf.industryCode, sf.countryCode, sf.costs)
    );
  }

  public async replaceEmployeesFractions(
    companyFacts: CompanyFacts,
    employeesFractionDTOUpdates: EmployeesFractionDTOUpdate[]
  ): Promise<void> {
    await this.employeesFractionRepository.remove(
      companyFacts.employeesFractions
    );
    companyFacts.employeesFractions = employeesFractionDTOUpdates.map(
      (ef) => new EmployeesFraction(undefined, ef.countryCode, ef.percentage)
    );
  }
}
