import { enumMapperByValue } from '@daniel-faber/json-ts';

export enum BalanceSheetType {
  Compact = 'Compact',
  Full = 'Full',
  Other = 'other',
}

export const balanceSheetTypeFromJSON =
  enumMapperByValue<BalanceSheetType>(BalanceSheetType);

export enum BalanceSheetVersion {
  // eslint-disable-next-line camelcase
  v5_0_4 = '5.04',
  // eslint-disable-next-line camelcase
  v5_0_5 = '5.05',
  // eslint-disable-next-line camelcase
  v5_0_6 = '5.06',
}

export const balanceSheetVersionFromJSON =
  enumMapperByValue<BalanceSheetVersion>(BalanceSheetVersion);

export enum Role {
  Admin = 'Admin',
  User = 'User',
}
