import i18next from '../i18n';
import { OldBalanceSheet } from '../models/oldBalanceSheet';

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
  balanceSheet: OldBalanceSheet,
  lng: keyof Translations
): OldBalanceSheet {
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
