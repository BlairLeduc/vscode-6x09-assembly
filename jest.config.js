/** @type {import('jest').Config} */
const config = {
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
  ],
};

module.exports = config;
