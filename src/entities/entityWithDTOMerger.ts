import { BalanceSheetDTOUpdate } from "../dto/update/balanceSheetUpdate.dto";
import { BalanceSheet } from "./balanceSheet";
import { CompanyFacts } from "./companyFacts";
import { CompanyFactsDTOUpdate } from "../dto/update/companyFactsUpdate.dto";
import { SupplyFractionDTOUpdate } from "../dto/update/supplyFractionUpdate.dto";
import { Repository } from "typeorm";
import { SupplyFraction } from "./supplyFraction";
import { EmployeesFraction } from "./employeesFraction";
import { EmployeesFractionDTOUpdate } from "../dto/update/employeesFractionUpdate.dto";
import { Rating } from "./rating";
import { RatingDTOUpdate } from "../dto/update/ratingUpdate.dto";
import { Topic } from "./topic";

export class EntityWithDTOMerger {

    public constructor(private supplyFractionRepository: Repository<SupplyFraction>,
        private employeesFractionRepository: Repository<EmployeesFraction>) {
    }

    public async mergeBalanceSheet(balanceSheet: BalanceSheet, balanceSheetDTOUpdate: BalanceSheetDTOUpdate): Promise<void> {
        if (balanceSheetDTOUpdate.companyFacts) {
            await this.mergeCompanyFacts(balanceSheet.companyFacts, balanceSheetDTOUpdate.companyFacts);
        }
        if (balanceSheetDTOUpdate.rating) {
            this.mergeRating(balanceSheet.rating, balanceSheetDTOUpdate.rating);
        }
    }

    public async mergeCompanyFacts(companyFacts: CompanyFacts, companyFactsDTOUpdate: CompanyFactsDTOUpdate): Promise<void> {
        companyFacts.totalPurchaseFromSuppliers = this.mergeVal(companyFacts.totalPurchaseFromSuppliers, companyFactsDTOUpdate.totalPurchaseFromSuppliers);
        companyFacts.totalStaffCosts = this.mergeVal(companyFacts.totalStaffCosts, companyFactsDTOUpdate.totalStaffCosts);
        companyFacts.profit = this.mergeVal(companyFacts.profit, companyFactsDTOUpdate.profit);
        companyFacts.financialCosts = this.mergeVal(companyFacts.financialCosts, companyFactsDTOUpdate.financialCosts);
        companyFacts.incomeFromFinancialInvestments = this.mergeVal(companyFacts.incomeFromFinancialInvestments);
        companyFacts.additionsToFixedAssets = this.mergeVal(companyFacts.additionsToFixedAssets, companyFactsDTOUpdate.additionsToFixedAssets);
        if (companyFactsDTOUpdate.supplyFractions) {
            await this.replaceSupplyFractions(companyFacts, companyFactsDTOUpdate.supplyFractions);
        }
        if (companyFactsDTOUpdate.employeesFractions) {
            await this.replaceEmployeesFractions(companyFacts, companyFactsDTOUpdate.employeesFractions);
        }
    }

    public mergeRating(rating: Rating, ratingDTOUpdate: RatingDTOUpdate) {
        if (ratingDTOUpdate.topics) {
            for (const topicDTOUpdate of ratingDTOUpdate.topics) {
                const topic: Topic | undefined = rating.topics.find(t => t.id === topicDTOUpdate.id);
                if (topic) {
                    topic.estimations = this.mergeVal(topic.estimations, topicDTOUpdate.estimations);
                    topic.weight = this.mergeVal(topic.weight, topicDTOUpdate.weight);
                } else {
                    throw Error(`Cannot find topic with id ${topicDTOUpdate.id}`);
                }
            }
        }
    }

    public async replaceSupplyFractions(companyFacts: CompanyFacts, supplyFractionDTOUpdates: SupplyFractionDTOUpdate[]): Promise<void> {
        await this.supplyFractionRepository.remove(companyFacts.supplyFractions);
        companyFacts.supplyFractions = supplyFractionDTOUpdates.map(sf => new SupplyFraction(undefined, sf.countryCode, sf.costs));
    }

    public async replaceEmployeesFractions(companyFacts: CompanyFacts, employeesFractionDTOUpdates: EmployeesFractionDTOUpdate[]): Promise<void> {
        await this.employeesFractionRepository.remove(companyFacts.employeesFractions);
        companyFacts.employeesFractions = employeesFractionDTOUpdates.map(ef => new EmployeesFraction(undefined, ef.countryCode, ef.percentage));
    }


    private mergeVal<T>(val: T, updatVal?: T): T {
        return updatVal ? updatVal : val;
    }



}