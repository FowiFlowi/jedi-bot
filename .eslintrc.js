module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "quotes": ["error", "single", { avoidEscape: true }],
        "no-trailing-spaces": ["error"],
        "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
        "eol-last": ["error", "always"],
        "semi": ["error", "never"]
    }
};
