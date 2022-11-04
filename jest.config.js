module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    collectCoverageFrom: [
        'src/js/*.js',
        'src/js/**/*.js',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/src/js/main.js',
        '/src/js/components/demo/DemoPage.tsx',
    ],
    transform: {
        '^.+\\.(js)$': 'babel-jest',
    },
    reporters: ['default'],
    transformIgnorePatterns: [],
    clearMocks: true,
};
