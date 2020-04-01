export class Environment {
    readonly username: string | undefined;
    readonly password: string | undefined;
    readonly dbUrl: string;
    constructor() {
        this.username = process.env.USER;
        this.password = process.env.PASS;
        this.dbUrl = process.env.DB_URL as string;
    }
}