import Provider from './provider';
import { StakeholderWeight } from '../models/stakeholder.weight';

export class StakeholderWeightsProvider extends Provider<string, number> {
  public merge(
    stakeholderWeights: StakeholderWeight[]
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
