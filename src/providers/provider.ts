class Provider<K, V> extends Map<K,V> {
  public getOrFail(key: K) {
    const value: V | undefined = this.get(key);
    if (value) {
      return value;
    } else {
      throw Error('Map entry not found.');
    }
  }
}

export default Provider;