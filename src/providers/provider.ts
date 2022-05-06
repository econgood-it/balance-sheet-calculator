import NotFoundException from '../exceptions/not.found.exception';

class Provider<K, V> extends Map<K, V> {
  public getOrFail(key: K) {
    const value: V | undefined = this.get(key);
    if (value !== undefined) {
      return value;
    } else {
      throw new NotFoundException(`Entry ${key} not found.`);
    }
  }
}

export default Provider;
