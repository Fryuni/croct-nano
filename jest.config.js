module.exports = {
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    setupFilesAfterEnv: ['jest-extended/all'],
    restoreMocks: true,
    resetMocks: true,
};
