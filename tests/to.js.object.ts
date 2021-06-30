export function toJsObject(object: any): any {
  return JSON.parse(JSON.stringify(object));
}
