enum Environment {
  DEV,
  PROD,
}

export class Configuration {
  public readonly entityRegex: string;
  public readonly migrationRegex: string;
  constructor(
    public readonly dbName: string,
    public readonly dbPort: number,
    public readonly dbUser: string,
    public readonly dbPassword: string,
    public readonly environment: Environment,
    public readonly appUsername: string,
    public readonly appPassword: string,
    public readonly appPort: number
  ) {
    const basePath = environment === Environment.PROD ? 'dist/' : 'src/';
    const fileExtension = environment === Environment.PROD ? 'js' : 'ts';
    this.entityRegex = basePath + 'entities/**/*.' + fileExtension;
    this.migrationRegex = basePath + 'migrations/**/*.' + fileExtension;
  }
}

export class ConfigurationReader {
  public static read(): Configuration {
    const dbName = process.env.DB_NAME;
    const dbPort = process.env.DB_PORT;
    const dbUser = process.env.DB_USER;
    const dbPassword = process.env.DB_PASSWORD;
    const environment = process.env.ENVIRONMENT;
    const appPort = process.env.PORT;
    const appUser = process.env.USERNAME;
    const appPassword = process.env.PASSWORD;
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_NAME', dbName);
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_PORT', dbPort);
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_USER', dbUser);
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'DB_PASSWORD',
      dbPassword
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ENVIRONMENT',
      environment
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet('USERNAME', appUser);
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'PASSWORD',
      appPassword
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet('PORT', appPort);
    let environmentAsEnum: Environment;
    if (environment === 'DEV') {
      environmentAsEnum = Environment.DEV;
    } else if (environment === 'PROD') {
      environmentAsEnum = Environment.PROD;
    } else {
      throw Error(
        'Unsupported value for ENVIRONMENT. Allowed are only DEV and PROD'
      );
    }
    return new Configuration(
      dbName as string,
      Number(dbPort),
      dbUser as string,
      dbPassword as string,
      environmentAsEnum,
      appUser as string,
      appPassword as string,
      Number(appPort)
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
