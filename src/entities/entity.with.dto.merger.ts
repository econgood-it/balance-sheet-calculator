import { BalanceSheetDTOUpdate } from "../dto/update/balance.sheet.update.dto";
import { BalanceSheet } from "./balanceSheet";
import { CompanyFacts } from "./companyFacts";
import { CompanyFactsDTOUpdate } from "../dto/update/company.facts.update.dto";
import { SupplyFractionDTOUpdate } from "../dto/update/supply.fraction.update.dto";
import {Column, PrimaryGeneratedColumn, Repository} from "typeorm";
import { SupplyFraction } from "./supplyFraction";
import { EmployeesFraction } from "./employeesFraction";
import { EmployeesFractionDTOUpdate } from "../dto/update/employees.fraction.update.dto";
import { Rating } from "./rating";
import { RatingDTOUpdate } from "../dto/update/rating.update.dto";
import { Topic } from "./topic";
import { BalanceSheetType } from "./enums";
import { TopicDTOUpdate } from "../dto/update/topic.update.dto";
import { Aspect } from "./aspect";
import {IndustrySectorDtoUpdate} from "../dto/update/industry.sector.update.dto";
import {IndustrySector} from "./industry.sector";

export class EntityWithDtoMerger {

    public constructor(private supplyFractionRepository: Repository<SupplyFraction>,
                       private employeesFractionRepository: Repository<EmployeesFraction>,
                       private industrySectorRepository: Repository<IndustrySector>) {
    }

    public async mergeBalanceSheet(balanceSheet: BalanceSheet, balanceSheetDTOUpdate: BalanceSheetDTOUpdate): Promise<void> {
        if (balanceSheetDTOUpdate.companyFacts) {
            await this.mergeCompanyFacts(balanceSheet.companyFacts, balanceSheetDTOUpdate.companyFacts);
        }
        if (balanceSheetDTOUpdate.rating) {
            this.mergeRating(balanceSheet.rating, balanceSheetDTOUpdate.rating, balanceSheet.type);
        }
    }

    public async mergeCompanyFacts(companyFacts: CompanyFacts, companyFactsDTOUpdate: CompanyFactsDTOUpdate): Promise<void> {
        companyFacts.totalPurchaseFromSuppliers = this.mergeVal(companyFacts.totalPurchaseFromSuppliers, companyFactsDTOUpdate.totalPurchaseFromSuppliers);
        companyFacts.totalStaffCosts = this.mergeVal(companyFacts.totalStaffCosts, companyFactsDTOUpdate.totalStaffCosts);
        companyFacts.profit = this.mergeVal(companyFacts.profit, companyFactsDTOUpdate.profit);
        companyFacts.financialCosts = this.mergeVal(companyFacts.financialCosts, companyFactsDTOUpdate.financialCosts);
        companyFacts.incomeFromFinancialInvestments = this.mergeVal(companyFacts.incomeFromFinancialInvestments,
            companyFactsDTOUpdate.incomeFromFinancialInvestments);
        companyFacts.additionsToFixedAssets = this.mergeVal(companyFacts.additionsToFixedAssets, companyFactsDTOUpdate.additionsToFixedAssets);
        companyFacts.turnover = this.mergeVal(companyFacts.turnover, companyFactsDTOUpdate.turnover);
        companyFacts.totalAssets = this.mergeVal(companyFacts.totalAssets, companyFactsDTOUpdate.totalAssets);
        companyFacts.totalSales = this.mergeVal(companyFacts.totalSales, companyFactsDTOUpdate.totalSales);
        companyFacts.financialAssetsAndCashBalance = this.mergeVal(companyFacts.financialAssetsAndCashBalance,
          companyFactsDTOUpdate.financialAssetsAndCashBalance);
        companyFacts.numberOfEmployees = this.mergeVal(companyFacts.numberOfEmployees,
          companyFactsDTOUpdate.numberOfEmployees);
        companyFacts.hasCanteen = this.mergeVal(companyFacts.hasCanteen, companyFactsDTOUpdate.hasCanteen);
        companyFacts.averageJourneyToWorkForStaffInKm = this.mergeVal(companyFacts.averageJourneyToWorkForStaffInKm,
          companyFactsDTOUpdate.averageJourneyToWorkForStaffInKm);
        if (companyFactsDTOUpdate.industrySectors) {
            await this.replaceIndustrySectors(companyFacts, companyFactsDTOUpdate.industrySectors);
        }
        if (companyFactsDTOUpdate.supplyFractions) {
            await this.replaceSupplyFractions(companyFacts, companyFactsDTOUpdate.supplyFractions);
        }
        if (companyFactsDTOUpdate.employeesFractions) {
            await this.replaceEmployeesFractions(companyFacts, companyFactsDTOUpdate.employeesFractions);
        }
    }

    public mergeRating(rating: Rating, ratingDTOUpdate: RatingDTOUpdate, balanceSheetType: BalanceSheetType) {
        if (ratingDTOUpdate.topics) {
            for (const topicDTOUpdate of ratingDTOUpdate.topics) {
                const topic: Topic | undefined = rating.topics.find(t => t.shortName === topicDTOUpdate.shortName);
                if (topic) {
                    this.mergeTopic(topic, topicDTOUpdate, balanceSheetType);
                } else {
                    throw Error(`Cannot find topic ${topicDTOUpdate.shortName}`);
                }
            }
        }
    }

    public mergeTopic(topic: Topic, topicDTOUpdate: TopicDTOUpdate, balanceSheetType: BalanceSheetType) {
        for (const aspectDTOUpdate of topicDTOUpdate.aspects) {
            const aspect: Aspect | undefined = topic.aspects.find(a => a.shortName === aspectDTOUpdate.shortName);
            if (aspect) {
                aspect.estimations = this.mergeVal(aspect.estimations, aspectDTOUpdate.estimations);
                if (aspect.isPositive && aspectDTOUpdate.weight !== undefined) {
                    aspect.isWeightSelectedByUser = true;
                    aspect.weight = this.mergeVal(aspect.weight, aspectDTOUpdate.weight);
                }
            } else {
                throw Error(`Cannot find aspect ${aspectDTOUpdate.shortName}`);
            }
        }
        topic.isWeightSelectedByUser = topicDTOUpdate.weight ? true : false;
        topic.weight = this.mergeVal(topic.weight, topicDTOUpdate.weight);
    }

    public async replaceIndustrySectors(companyFacts: CompanyFacts,
                                        industrySectorDTOUpdates: IndustrySectorDtoUpdate[]): Promise<void> {
        await this.industrySectorRepository.remove(companyFacts.industrySectors);
        companyFacts.industrySectors = industrySectorDTOUpdates.map(is => new IndustrySector(undefined,
          is.industryCode, is.amountOfTotalTurnover, is.description));
    }

    public async replaceSupplyFractions(companyFacts: CompanyFacts, supplyFractionDTOUpdates: SupplyFractionDTOUpdate[]): Promise<void> {
        await this.supplyFractionRepository.remove(companyFacts.supplyFractions);
        companyFacts.supplyFractions = supplyFractionDTOUpdates.map(sf => new SupplyFraction(undefined, sf.industryCode, sf.countryCode, sf.costs));
    }

    public async replaceEmployeesFractions(companyFacts: CompanyFacts, employeesFractionDTOUpdates: EmployeesFractionDTOUpdate[]): Promise<void> {
        await this.employeesFractionRepository.remove(companyFacts.employeesFractions);
        companyFacts.employeesFractions = employeesFractionDTOUpdates.map(ef => new EmployeesFraction(undefined, ef.countryCode, ef.percentage));
    }


    private mergeVal<T>(val: T, updatVal: T | undefined): T {
        return updatVal !== undefined ? updatVal : val;
    }



}