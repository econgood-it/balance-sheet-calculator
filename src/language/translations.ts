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
