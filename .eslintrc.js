// Workaround for https://github.com/eslint/eslint/issues/3458
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    extends: ['plugin:@croct/typescript'],
    plugins: ['@croct'],
    ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**'],
    parserOptions: {
        project: ['**/tsconfig.json'],
    },
};
