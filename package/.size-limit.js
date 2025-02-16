module.exports = [
    {
        name: 'Full with all deps',
        path: 'dist/index.mjs',
        import: '{ croctContent }',
        ignore: [],
    },
    {
        name: 'Already using Croct',
        path: 'dist/index.mjs',
        import: '{ croctContent }',
        ignore: ['@croct/plug'],
    },
    {
        name: 'Already using Nanostores',
        path: 'dist/index.mjs',
        import: '{ croctContent }',
        ignore: ['@croct/plug', 'nanostores', '@nanostores/persistent'],
    },
];
