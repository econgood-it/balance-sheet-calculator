import {GraphQLError, GraphQLString} from "graphql";
import BalanceSheet, {IBalanceSheet} from "../models/balanceSheet.model";
import {BalanceSheetType} from "./BalanceSheetType";
import {CompanyFactsInput} from "./CompanyFactsInput";
import {StakeholderWeightCalculator} from "../calculations/StakeholderWeightCalculator";
import {MaxPointsCalculator} from "../calculations/MaxPointsCalculator";
import CompanyFacts, {ICompanyFacts} from "../models/companyFacts.model";
import Rating, {IRating} from "../models/rating.model";
import {ArgumentParser} from "./ArgumentParser";
import {RatingInput} from "./RatingInput";
import {ITopic} from "../models/topic.model";

export const BalanceSheetUpdate = {
    type: BalanceSheetType,
    args: {
        id: {type: GraphQLString},
        companyFacts: {type: CompanyFactsInput},
        rating: {type: RatingInput}
    },
    resolve: async (root: any, args: any) => {
        let balanceSheetOpt: IBalanceSheet | null = await BalanceSheet.findById(args.id);
        if (!balanceSheetOpt) {
            throw new Error(`Cannot find and update balancesheet with id ${args.id}`);
        }
        let balanceSheet: IBalanceSheet = balanceSheetOpt as IBalanceSheet;
        let companyFactsOpt: ICompanyFacts | null;
        if (args.companyFacts != null) {
            const companyFactsUpdate: any = ArgumentParser.parse(args.companyFacts);
            companyFactsOpt = await CompanyFacts.findByIdAndUpdate(balanceSheet.companyFacts,
                companyFactsUpdate, {upsert: false, new: true});
        } else {
            companyFactsOpt = await CompanyFacts.findById(balanceSheet.companyFacts);
        }
        if (!companyFactsOpt) {
            throw new Error('Cannot update company facts of balancesheet');
        }
        const companyFacts: ICompanyFacts = companyFactsOpt as ICompanyFacts;
        let ratingOpt: IRating | null = await Rating.findById(balanceSheet.rating);
        if (!ratingOpt) {
            throw new Error('Cannot update rating of balancesheet');
        }
        const rating: IRating = ratingOpt as IRating;
        if (args.rating != null) {
            const ratingUpdate = ArgumentParser.parse(args.rating);
            ratingUpdate['topics'].forEach((topicUpdate: any) => {
                const foundTopics: ITopic[] = rating.topics.filter(topic => topic.shortName === topicUpdate.shortName);
                if (foundTopics.length !== 0) {
                    foundTopics.forEach(topic => topic.estimations = topicUpdate['estimations']);
                } else {
                    throw new Error("Cannot find topic with shortName " + topicUpdate.shortName);
                }
            });
        }
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(companyFacts);
        await maxPointsCalculator.updateMaxPointsOfTopics(rating.topics);
        await rating.save();
        balanceSheetOpt = await BalanceSheet.findById(args.id);
        if (!balanceSheetOpt) {
            throw new Error('Cannot find balancesheet with id');
        }
        return (balanceSheetOpt as IBalanceSheet).populate('companyFacts').populate('rating').execPopulate();
    }};