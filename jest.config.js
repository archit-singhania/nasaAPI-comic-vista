module.exports = {
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.js', '.jsx'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(axios|@testing-library)/)'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^axios$': 'axios/dist/node/axios.cjs'
  },
  testMatch: [
    '**/__tests__/**/*.test.{js,jsx}',
    '**/?(*.)+(spec|test).{js,jsx}',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};