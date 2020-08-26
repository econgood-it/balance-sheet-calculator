import { enumMapperByValue } from "@daniel-faber/json-ts";

export enum BalanceSheetType {
    Compact = 'Compact',
    Full = 'Full',
    Other = 'other'
}

export const balanceSheetTypeFromJSON = enumMapperByValue<BalanceSheetType>(BalanceSheetType);
