export const range = (start: number, end: number): number[] =>
  Array.from(Array(end - start + 1).keys()).map((x) => x + start);
export const filterUndef = <T>(ts: (T | undefined)[]): T[] => {
  return ts.filter((t: T | undefined): t is T => t !== undefined);
};
