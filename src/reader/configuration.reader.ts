export enum Environment {
  DEV = 'DEV',
  TEST = 'TEST',
  PROD = 'PROD',
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
    public readonly appPort: number,
    public readonly docsUser: string,
    public readonly docsPassword: string,
    public readonly zitadelKeyId: string,
    public readonly zitadelKey: string,
    public readonly zitadelAppId: string,
    public readonly zitadelClientId: string,
    public readonly zitadelAuthorityUrl: string,
    public readonly zitadelApiToken: string,
    public readonly zitadelApiUrl: string,
    public readonly ecgAuditAdminId: string,
    public readonly ecgPeerGroupAdminId: string,
    public readonly ecgAuditApiUserId: string
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
    const zitadelKeyId = process.env.ZITADEL_KEY_ID;
    const zitadelKey = process.env.ZITADEL_KEY;
    const zitadelAppId = process.env.ZITADEL_APP_ID;
    const zitadelClientId = process.env.ZITADEL_CLIENT_ID;
    const zitadelAuthorityUrl = process.env.ZITADEL_AUTHORITY_URL;
    const zitadelApiToken = process.env.ZITADEL_API_TOKEN;
    const ecgAuditAdminId = process.env.ECG_AUDIT_ADMIN_ID;
    const ecgPeerGroupAdminId = process.env.ECG_PEER_GROUP_ADMIN_ID;
    const ecgAuditApiUserId = process.env.ECG_AUDIT_API_USER_ID;
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_NAME', dbName);
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_PORT', dbPort);
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_HOST', dbHost);
    ConfigurationReader.checkIfEnvironmentVariableIsSet('DB_USER', dbUser);
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'DB_PASSWORD',
      dbPassword
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ENVIRONMENT',
      environment
    );

    ConfigurationReader.checkIfEnvironmentVariableIsSet('DOCS_USER', docsUser);
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'DOCS_PASSWORD',
      docsPassword
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet('PORT', appPort);

    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ZITADEL_KEY_ID',
      zitadelKeyId
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ZITADEL_KEY',
      zitadelKey
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ZITADEL_APP_ID',
      zitadelAppId
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ZITADEL_CLIENT_ID',
      zitadelClientId
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ZITADEL_AUTHORITY_URL',
      zitadelAuthorityUrl
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ZITADEL_API_TOKEN',
      zitadelApiToken
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ECG_AUDIT_ADMIN_ID',
      ecgAuditAdminId
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ECG_PEER_GROUP_ADMIN_ID',
      ecgPeerGroupAdminId
    );
    ConfigurationReader.checkIfEnvironmentVariableIsSet(
      'ECG_AUDIT_API_USER_ID',
      ecgAuditApiUserId
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
    const authUrl = zitadelAuthorityUrl as string;
    const zitadelApiUrl = new URL(authUrl).origin;

    return new Configuration(
      dbName as string,
      dbHost as string,
      Number(dbPort),
      dbUser as string,
      dbPassword as string,
      environmentAsEnum,
      Number(appPort),
      docsUser as string,
      docsPassword as string,
      zitadelKeyId as string,
      zitadelKey as string,
      zitadelAppId as string,
      zitadelClientId as string,
      authUrl,
      zitadelApiToken as string,
      zitadelApiUrl,
      ecgAuditAdminId as string,
      ecgPeerGroupAdminId as string,
      ecgAuditApiUserId as string
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
