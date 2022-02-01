module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    collectCoverageFrom: [
        'assets/js/*.js',
        'assets/js/**/*.js',
    ],
    transform: {
        '^.+\\.(js)$': 'babel-jest',
    },
    transformIgnorePatterns: [],
    clearMocks: true,
};
