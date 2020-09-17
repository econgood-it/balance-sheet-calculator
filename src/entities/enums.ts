import { enumMapperByValue } from "@daniel-faber/json-ts";

export enum BalanceSheetType {
    Compact = 'Compact',
    Full = 'Full',
    Other = 'other'
}

export const balanceSheetTypeFromJSON = enumMapperByValue<BalanceSheetType>(BalanceSheetType);

export enum BalanceSheetVersion {
    v5_0_4 = '5.04',
}

export const balanceSheetVersionFromJSON = enumMapperByValue<BalanceSheetVersion>(BalanceSheetVersion);
