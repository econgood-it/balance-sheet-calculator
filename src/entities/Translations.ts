export interface Translations {
  de: string,
  en: string,
}

const DefaultTranslations = {
  de: '',
  en: ''
}

export const createTranslations = (lng: keyof Translations, value: string): Translations => {
  const defaultTranslations = DefaultTranslations;
  defaultTranslations[lng] = value;
  return defaultTranslations;
}

export const updateTranslationOfLanguage = (translations: Translations,
                                            lng: keyof Translations, value: string): Translations => {
  translations[lng] = value;
  return translations;
}