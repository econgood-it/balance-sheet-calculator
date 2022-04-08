import { DEFAULT_COUNTRY_CODE } from '../../entities/region';
import { createTranslations, Translations } from '../../entities/Translations';
import { CompanySize } from '../../calculations/employees.calc';

export class Value {
  constructor(public readonly value: string) {}

  public get text(): string {
    return this.value;
  }

  public get number(): number {
    return Number.parseFloat(this.value);
  }

  public get boolean(): boolean {
    switch (this.value) {
      case 'yes':
        return true;
      case 'ja':
        return true;
      default:
        return false;
    }
  }

  public get percentage(): number {
    return this.number;
  }

  public get countryCode(): string {
    const countryCode = this.splitAndGetFirst(' ');
    return countryCode.length <= 3 ? countryCode : DEFAULT_COUNTRY_CODE;
  }

  public get industryCode(): string {
    return this.splitAndGetFirst('-');
  }

  public get isWeightSelectedByUser(): boolean {
    return (
      this.value.startsWith('Weighting changed') ||
      this.value.startsWith('Gewichtung geändert')
    );
  }

  public get isPositiveAspect(): boolean {
    return !this.value.startsWith('Negativ');
  }

  public get weight(): number {
    return this.getNumberWithDefault(1);
  }

  public get numberWithDefault0(): number {
    return this.getNumberWithDefault(0);
  }

  public getDescription(lng: keyof Translations) {
    return createTranslations(lng, this.value);
  }

  public parseAsCompanySize(): CompanySize {
    if (['Micro-business', 'Kleinstunternehmen'].includes(this.value)) {
      return CompanySize.micro;
    } else if (['Small business', 'Kleinunternehmen'].includes(this.value)) {
      return CompanySize.small;
    } else if (
      ['Medium business', 'Mittleres Unternehmen'].includes(this.value)
    ) {
      return CompanySize.middle;
    }

    return CompanySize.large;
  }

  private splitAndGetFirst(splitBy: string): string {
    return this.value.split(splitBy)[0].trim();
  }

  private getNumberWithDefault(defaultValue: number): number {
    return !isNaN(this.number) ? this.number : defaultValue;
  }
}
