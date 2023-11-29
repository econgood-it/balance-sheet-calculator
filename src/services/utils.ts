export function parseSaveFlag(saveParam: any): boolean {
  return !(
    saveParam !== undefined &&
    typeof saveParam === 'string' &&
    saveParam.toLowerCase() === 'false'
  );
}
