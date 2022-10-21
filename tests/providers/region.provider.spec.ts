import { RegionProvider } from '../../src/providers/region.provider';
import { BalanceSheetVersion } from '../../src/entities/enums';

describe('Region Provider', () => {
  it('returns regions of version 5.08', async () => {
    const regionProvider = await RegionProvider.fromVersion(
      BalanceSheetVersion.v5_0_8
    );
    expect(regionProvider.getOrFail('ASM')).toMatchObject({
      pppIndex: 1.49858687129258,
      countryCode: 'ASM',
      countryName: 'American Samoa',
      ituc: 4.05,
    });
    expect(regionProvider.getOrFail('ATG')).toMatchObject({
      pppIndex: 1.77524540295726,
      countryCode: 'ATG',
      countryName: 'Antigua and Barbuda',
      ituc: 3.52,
    });
  });
});
