import i18next from '../i18n';
import { BalanceSheet } from '../models/balance.sheet';

export interface Translations {
  de: string;
  en: string;
}

const DefaultTranslations = {
  de: '',
  en: '',
};
type ValidLanguage = keyof Translations;

export const parseLanguageParameter = (lngParam: any): keyof Translations => {
  if (DefaultTranslations[lngParam as ValidLanguage] === '') {
    return lngParam as ValidLanguage;
  } else {
    return 'en';
  }
};

export function translateBalanceSheet(
  balanceSheet: BalanceSheet,
  lng: keyof Translations
): BalanceSheet {
  return {
    ...balanceSheet,
    ratings: balanceSheet.ratings.map((r) => ({
      ...r,
      name: staticTranslate(lng, r.name),
    })),
  };
}

const staticTranslate = (lng: keyof Translations, transKey: string): string => {
  return i18next.t(transKey, { lng });
};
