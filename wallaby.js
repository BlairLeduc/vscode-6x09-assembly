module.exports = function (wallaby) {

  return {
    files: [
      'src/constants/*.ts',
      'src/parsers/docs.ts',
      'src/parsers/line-parser.ts',
      'src/test/fakes/*.ts',
    ],

    tests: [
      'src/test/unit/**/*.spec.ts',
    ],

    testFramework: 'mocha',

    env: {
      type: 'node',
      runner: 'node'
    },
    workers: {recycle: true},
    compilers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'src/**/*.ts': wallaby.compilers.typeScript()
    },

  };
};
