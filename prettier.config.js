/** @type {import("prettier").Config} */
export default {
    printWidth: 100,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
    arrowParens: 'avoid',
    plugins: ['prettier-plugin-astro'],
    overrides: [
        {
            files: ['**/*.astro'],
            options: {
                parser: 'astro',
            },
        },
    ],
};
