export function mergeVal<T>(val: T, updatVal: T | undefined): T {
  return updatVal !== undefined ? updatVal : val;
}
