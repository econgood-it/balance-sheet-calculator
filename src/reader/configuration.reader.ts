export enum Environment {
  DEV,
  TEST,
  PROD,
}

export class Configuration {
  public readonly entityRegex: string;
  public readonly migrationRegex: string;
  constructor(
    public readonly dbName: string,
    public readonly dbHost: string,
    public readonly dbPort: number,
    public readonly dbUser: string,
    public readonly dbPassword: string,
    public readonly environment: Environment,
    public readonly adminEmail: string,
    public readonly adminPassword: string,
    public readonly appPort: number,
    public readonly jwtSecret: string,
    public readonly docsUser: string,
    public readonly docsPassword: string,
    public readonly workbookApiToken: string
  ) {
    const basePath = [Environment.TEST, Environment.PROD].includes(environment)
      ? 'dist/'
      : 'src/';
    const fileExtension = [Environment.TEST, Environment.PROD].includes(
      environment
    )
      ? 'js'
      : 'ts';
    this.entityRegex = basePath + 'entities/**/*.' + fileExtension;
    this.migrationRegex = basePath + 'migrations/**/*.' + fileExtension;
  }
}

export class ConfigurationReader {
  public static read(): Configuration {
    const dbName = process.env.DB_NAME;
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const environment = process.env.ENVIRONMENT;
    const appPort = process.env.PORT;
    const docsUser = process.env.DOCS_USER;
    const docsPassword = process.env.DOCS_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtsecret = process.env.JWT_SECRET;
    const workbookApiToken = process.env.WORKBOOK_API_TOKEN;
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_NAME', dbName);
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_PORT', dbPort);
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_HOST', dbPort);
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_USER', dbUser);
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'DB_PASSWORD',
      dbPassword
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ENVIRONMENT',
      environment
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ADMIN_EMAIL',
      adminEmail
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ADMIN_PASSWORD',
      adminPassword
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DOCS_USER', docsUser);
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'DOCS_PASSWORD',
      docsPassword
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'JWT_SECRET',
      jwtsecret
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet('PORT', appPort);
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'WORKBOOK_API_TOKEN',
      workbookApiToken
    );
    let environmentAsEnum: Environment;
    if (environment === 'DEV') {
      environmentAsEnum = Environment.DEV;
    } else if (environment === 'TEST') {
      environmentAsEnum = Environment.TEST;
    } else if (environment === 'PROD') {
      environmentAsEnum = Environment.PROD;
    } else {
      throw Error(
        'Unsupported value for ENVIRONMENT. Allowed are only DEV, TEST and PROD'
      );
    }
    return new Configuration(
      dbName as string,
      dbHost as string,
      Number(dbPort),
      dbUser as string,
      dbPassword as string,
      environmentAsEnum,
      adminEmail as string,
      adminPassword as string,
      Number(appPort),
      jwtsecret as string,
      docsUser as string,
      docsPassword as string,
      workbookApiToken as string
    );
  }

  private static checkIfEnvironmentVariableIsSet(
    envName: string,
    envValue: any
  ): void {
    if (!envValue) {
      throw Error(`Environment variable ${envName} is not set.`);
    }
  }
}
