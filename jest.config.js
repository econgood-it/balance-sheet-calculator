module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['src/', 'tests/'],
  coverageReporters: ['html'],
  setupFilesAfterEnv: ['./tests/setup-tests.ts'],
};
