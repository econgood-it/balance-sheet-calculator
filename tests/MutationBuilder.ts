export class MutationBuilder {
    private mutation: string;
    constructor() {
        this.mutation = 'mutation {'
    }

    public method(methodName: string) {
        this.mutation += methodName + '(';
        return this;
    }

    public arguments(args: string) {
        this.mutation += args;
        return this;
    }

    public output(output: string) {
        this.mutation += ')' + output;
        return this;
    }

    public build() {
        return this.mutation + "}"
    }
}