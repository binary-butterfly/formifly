module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    collectCoverageFrom: [
        'assets/js/*.js',
        'assets/js/**/*.js',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/assets/js/main.js',
        '/assets/js/components/demo/DemoPage.js',
    ],
    transform: {
        '^.+\\.(js)$': 'babel-jest',
    },
    transformIgnorePatterns: [],
    clearMocks: true,
};
