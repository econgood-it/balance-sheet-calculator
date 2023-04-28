import {
  ConfigurationReader,
  Environment,
} from '../../src/reader/configuration.reader';

describe('ConfigurationReader', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it('should use environment variables for config', function () {
    const dbName = 'balancesheet';
    const dbHost = 'localhost';
    const dbPort = '5433';
    const dbUser = 'postgres';
    const dbPwd = 'crazypwd';
    const env = 'DEV';
    const adminMail = 'admin@example.com';
    const adminPwd = 'crazyadminpwd';
    const docsUser = 'docsuser';
    const docsPwd = 'crazydocspwd';
    const port = '4000';
    const jwtSecrect = 'crazyjwtPwd';
    const workbookToken = 'crazyworkbookPwd';
    process.env.DB_NAME = dbName;
    process.env.DB_HOST = dbHost;
    process.env.DB_PORT = dbPort;
    process.env.DB_USER = dbUser;
    process.env.DB_PASSWORD = dbPwd;
    process.env.ENVIRONMENT = env;
    process.env.PORT = port;
    process.env.DOCS_USER = docsUser;
    process.env.DOCS_PASSWORD = docsPwd;
    process.env.ADMIN_EMAIL = adminMail;
    process.env.ADMIN_PASSWORD = adminPwd;
    process.env.JWT_SECRET = jwtSecrect;
    process.env.WORKBOOK_API_TOKEN = workbookToken;
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
    expect(config.adminEmail).toBe(adminMail);
    expect(config.adminPassword).toBe(adminPwd);
    expect(config.jwtSecret).toBe(jwtSecrect);
    expect(config.workbookApiToken).toBe(workbookToken);
  });
});
