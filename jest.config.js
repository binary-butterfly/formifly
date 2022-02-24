module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    collectCoverageFrom: [
        'src/js/*.js',
        'src/js/**/*.js',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/src/js/main.js',
        '/src/js/components/demo/DemoPage.js',
    ],
    transform: {
        '^.+\\.(js)$': 'babel-jest',
    },
    reporters: ['default', 'jest-junit'],
    transformIgnorePatterns: [],
    clearMocks: true,
};
