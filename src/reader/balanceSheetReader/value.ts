import { CompanySize } from '../../calculations/old.employees.calc';
import { none, Option, some } from '../../calculations/option';

import { AVERAGE_REGION_NAME_TO_COUNTRY_CODE } from '../../models/region';
import { BalanceSheetVersion } from '@ecogood/e-calculator-schemas/dist/shared.schemas';

export class Value {
  constructor(public readonly value: string) {}

  public get text(): string {
    return this.value;
  }

  public get number(): number {
    return Number.parseFloat(this.value);
  }

  public parseAsOptionalBoolean(): boolean | undefined {
    switch (this.value) {
      case 'yes':
        return true;
      case 'ja':
        return true;
      case 'no':
        return false;
      case 'nein':
        return false;
      default:
        return undefined;
    }
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

  public get countryCode(): string | undefined {
    if (AVERAGE_REGION_NAME_TO_COUNTRY_CODE.has(this.value)) {
      return AVERAGE_REGION_NAME_TO_COUNTRY_CODE.get(this.value);
    }
    const countryCode = this.splitAndGetFirst(' ');
    return countryCode.length > 0 && countryCode.length <= 3
      ? countryCode
      : undefined;
  }

  public get industryCode(): string | undefined {
    return this.value !== 'Please choose' &&
      this.value !== 'Bitte Auswählen' &&
      this.value !== 'Please enter'
      ? this.splitAndGetFirst('-')
      : undefined;
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

  public parseAsOptionalNumber(): Option<number> {
    return !isNaN(this.number) ? some(this.number) : none();
  }

  public parseAsVersion(): BalanceSheetVersion {
    const match = Object.entries(BalanceSheetVersion).find(
      ([_, value]) => value === this.text
    );
    return match ? match[1] : BalanceSheetVersion.v5_0_8;
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
