import Provider from './provider';
import { OldStakeholderWeight } from '../models/oldStakeholderWeight';

export class OldStakeholderWeightsProvider extends Provider<string, number> {
  public merge(
    stakeholderWeights: OldStakeholderWeight[]
  ): OldStakeholderWeightsProvider {
    const stakeholderWeightsProvider = stakeholderWeights.reduce(
      (prevValue, current) => {
        prevValue.set(current.shortName, current.weight);
        return prevValue;
      },
      new OldStakeholderWeightsProvider()
    );
    return new OldStakeholderWeightsProvider([
      ...this.entries(),
      ...stakeholderWeightsProvider.entries(),
    ]);
  }
}
