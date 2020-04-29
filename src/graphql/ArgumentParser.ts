export class ArgumentParser {
    public static parse(args: any): any {
        const result: any = {};
        Object.keys(args).forEach(e => {
            if (args[e] !== undefined) {
                result[e] = args[e];
            }
        });
        return result;
    }
}