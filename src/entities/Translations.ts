import i18next from '../i18n';

export interface Translations {
  de: string;
  en: string;
}

const DefaultTranslations = {
  de: '',
  en: '',
};

type ValidLanguage = keyof Translations;

export const createTranslations = (
  lng: keyof Translations,
  value: string
): Translations => {
  const defaultTranslations = { ...DefaultTranslations };
  defaultTranslations[lng] = value;
  return defaultTranslations;
};

export const updateTranslationOfLanguage = (
  translations: Translations,
  lng: keyof Translations,
  value: string
): Translations => {
  translations[lng] = value;
  return translations;
};

export const getTranslationOfLanguage = (
  translations: Translations,
  lng: keyof Translations
): string => {
  return translations[lng] ? translations[lng] : '';
};

export const parseLanguageParameter = (lngParam: any): keyof Translations => {
  if (DefaultTranslations[lngParam as ValidLanguage] === '') {
    return lngParam as ValidLanguage;
  } else {
    return 'en';
  }
};

export const staticTranslate = (
  lng: keyof Translations,
  transKey: string
): string => {
  return i18next.t(transKey, { lng });
};
