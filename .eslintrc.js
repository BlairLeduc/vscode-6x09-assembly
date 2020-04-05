module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended'],
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", {
            "vars": "all",
            "args": "none",
            "ignoreRestSiblings": false
          }]
    }
}
