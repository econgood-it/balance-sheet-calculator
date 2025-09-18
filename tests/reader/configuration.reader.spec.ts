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
  const zitadelAuthUrl = 'https://zitadel.com:443';
  const zitadelKeyId = '382903810845309';
  const zitadelKey = 'fdjalrejwqpjl j---';
  const zitadelAppId = '489328014';
  const zitadelClientId = 'jdlasrjlrelqjrewq';
  const ecgAuditAdminId = '9489032859043872590';
  const ecgPeerGroupAdminId = '4832901483921748';
  const ecgAuditApiUserId = '43214838409312';
  const zitadelApiToken = 'fdjaklrheawhrelawjrklajfejkwajfioaewjfka';

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
    process.env.ECG_AUDIT_ADMIN_ID = ecgAuditAdminId;
    process.env.ECG_PEER_GROUP_ADMIN_ID = ecgPeerGroupAdminId;
    process.env.ECG_AUDIT_API_USER_ID = ecgAuditApiUserId;
    process.env.ZITADEL_KEY_ID = zitadelKeyId;
    process.env.ZITADEL_KEY = zitadelKey;
    process.env.ZITADEL_APP_ID = zitadelAppId;
    process.env.ZITADEL_CLIENT_ID = zitadelClientId;
    process.env.ZITADEL_AUTHORITY_URL = zitadelAuthUrl;
    process.env.ZITADEL_API_TOKEN = zitadelApiToken;
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
    expect(config.zitadelKeyId).toBe(zitadelKeyId);
    expect(config.zitadelKey).toBe(zitadelKey);
    expect(config.zitadelAppId).toBe(zitadelAppId);
    expect(config.zitadelClientId).toBe(zitadelClientId);
    expect(config.zitadelAuthorityUrl).toBe(zitadelAuthUrl);
    expect(config.zitadelApiToken).toBe(zitadelApiToken);
    expect(config.zitadelApiUrl).toBe('https://zitadel.com');
    expect(config.ecgAuditAdminId).toBe(ecgAuditAdminId);
    expect(config.ecgPeerGroupAdminId).toBe(ecgPeerGroupAdminId);
    expect(config.ecgAuditApiUserId).toBe(ecgAuditApiUserId);
  });

  it('should fail if dbHost is missing', function () {
    setAllEnvironmentVariables();
    delete process.env.DB_HOST;
    expect(() => {
      ConfigurationReader.read();
    }).toThrow('Environment variable DB_HOST is not set.');
  });
});
