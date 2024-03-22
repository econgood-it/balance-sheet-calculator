import Provider from './provider';
import { OldStakeholderWeight } from '../models/oldStakeholderWeight';

export class StakeholderWeightsProvider extends Provider<string, number> {
  public merge(
    stakeholderWeights: OldStakeholderWeight[]
  ): StakeholderWeightsProvider {
    const stakeholderWeightsProvider = stakeholderWeights.reduce(
      (prevValue, current) => {
        prevValue.set(current.shortName, current.weight);
        return prevValue;
      },
      new StakeholderWeightsProvider()
    );
    return new StakeholderWeightsProvider([
      ...this.entries(),
      ...stakeholderWeightsProvider.entries(),
    ]);
  }
}
