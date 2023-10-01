/** @type {import('jest').Config} */
const config = {
  reporters: [['github-actions', {silent: false}], 'summary'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
  ],
};

module.exports = config;
