import {
  ConfigurationReader,
  Environment,
} from '../../src/reader/configuration.reader';

describe('ConfigurationReader', () => {
  const OLD_ENV = process.env;
  const dbName = 'balancesheet';
  const dbHost = 'localhost';
  const dbPort = '5433';
  const dbUser = 'postgres';
  const dbPwd = 'crazypwd';
  const env = 'DEV';
  const docsUser = 'docsuser';
  const docsPwd = 'crazydocspwd';
  const port = '4000';
  const workbookToken = 'crazyworkbookPwd';
  const zitadelAuthUrl = 'https://zitadel.com';
  const zitadelKeyId = '382903810845309';
  const zitadelKey = 'fdjalrejwqpjl j---';
  const zitadelAppId = '489328014';
  const zitadelClientId = 'jdlasrjlrelqjrewq';

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterEach(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  function setAllEnvironmentVariables() {
    process.env.DB_NAME = dbName;
    process.env.DB_HOST = dbHost;
    process.env.DB_PORT = dbPort;
    process.env.DB_USER = dbUser;
    process.env.DB_PASSWORD = dbPwd;
    process.env.ENVIRONMENT = env;
    process.env.PORT = port;
    process.env.DOCS_USER = docsUser;
    process.env.DOCS_PASSWORD = docsPwd;
    process.env.WORKBOOK_API_TOKEN = workbookToken;
    process.env.ZITADEL_KEY_ID = zitadelKeyId;
    process.env.ZITADEL_KEY = zitadelKey;
    process.env.ZITADEL_APP_ID = zitadelAppId;
    process.env.ZITADEL_CLIENT_ID = zitadelClientId;
    process.env.ZITADEL_AUTHORITY_URL = zitadelAuthUrl;
  }

  it('should use environment variables for config', function () {
    setAllEnvironmentVariables();
    const config = ConfigurationReader.read();
    expect(config.dbName).toBe(dbName);
    expect(config.dbHost).toBe(dbHost);
    expect(config.dbPort).toBe(Number.parseInt(dbPort));
    expect(config.dbUser).toBe(dbUser);
    expect(config.dbPassword).toBe(dbPwd);
    expect(config.environment).toBe(Environment.DEV);
    expect(config.appPort).toBe(Number.parseInt(port));
    expect(config.docsUser).toBe(docsUser);
    expect(config.docsPassword).toBe(docsPwd);
    expect(config.workbookApiToken).toBe(workbookToken);
    expect(config.zitadelKeyId).toBe(zitadelKeyId);
    expect(config.zitadelKey).toBe(zitadelKey);
    expect(config.zitadelAppId).toBe(zitadelAppId);
    expect(config.zitadelClientId).toBe(zitadelClientId);
    expect(config.zitadelAuthorityUrl).toBe(zitadelAuthUrl);
  });

  it('should fail if dbHost is missing', function () {
    setAllEnvironmentVariables();
    delete process.env.DB_HOST;
    expect(() => {
      ConfigurationReader.read();
    }).toThrow('Environment variable DB_HOST is not set.');
  });
});
