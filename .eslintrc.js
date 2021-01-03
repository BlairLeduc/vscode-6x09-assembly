module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['plugin:@typescript-eslint/recommended'],
    rules: {
        "@typescript-eslint/no-unused-vars": ["error", {
            "vars": "all",
            "varsIgnorePattern": "^_",
            "args": "all",
            "argsIgnorePattern": "^_",
            "ignoreRestSiblings": false
        }],
        "prefer-const": ["error", {
            "destructuring": "all"
        }]
    }
};
