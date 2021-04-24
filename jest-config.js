module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js'],
    roots: ['<rootDir>'],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-extended'],
    globals: {
      
    },
    globalSetup: '<rootDir>/tests/global-setup.js',
    globalTeardown: '<rootDir>/tests/global-teardown.js',
  }