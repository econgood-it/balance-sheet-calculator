import mongoose from "mongoose";
import {Environment} from "../../src/environment";
import Region, {IRegion} from "../../src/models/region.model";
import BalanceSheet, {IBalanceSheet} from "../../src/models/balanceSheet.model";
import CompanyFacts, {ICompanyFacts} from "../../src/models/companyFacts.model";
import Rating, {IRating} from "../../src/models/rating.model";

export class DatabaseHandler {
    public static connectIfDisconnected(): void {
        // Connect to the database if the current readyState is equal to disconnected.
        if (mongoose.connection.readyState === 0) {
            mongoose.Promise = global.Promise;
            const environment = new Environment();
            mongoose.connect(environment.dbUrl, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useFindAndModify: false
            });
        }
    }

    public static async deleteAllEntriesAnddisconnect(): Promise<void> {

        try {
            await this.deleteAllEntries();
            // Connection to Mongo killed
            await mongoose.disconnect();
        } catch (error) {
            console.log(`In the cleanup process something wents wrong ${error}`);
            throw error;
        }
    }

    private static async deleteAllEntries(): Promise<void> {
        const regions: IRegion[] = await Region.find();
        for (const region of regions) {
            await Region.findByIdAndDelete(region.id);
        }
        const balanceSheets: IBalanceSheet[] = await BalanceSheet.find();
        for (const balanceSheet of balanceSheets) {
            await BalanceSheet.findByIdAndDelete(balanceSheet.id);
        }
        const companyFacts: ICompanyFacts[] = await CompanyFacts.find();
        for (const companyFact of companyFacts) {
            await CompanyFacts.findByIdAndDelete(companyFact.id);
        }
        const ratings: IRating[] = await Rating.find();
        for (const rating of ratings) {
            await Rating.findByIdAndDelete(rating.id);
        }
    };
}