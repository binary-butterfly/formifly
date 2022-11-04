module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    collectCoverageFrom: [
        'src/js/*.(js|ts|jsx|tsx)',
        'src/js/**/*.(js|ts|jsx|tsx)',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/src/js/main.js',
        '/src/js/components/demo/DemoPage.tsx',
    ],
    transform: {
        '^.+\\.(js|ts|jsx|tsx)$': 'babel-jest',
    },
    reporters: ['default'],
    transformIgnorePatterns: [],
    clearMocks: true,
};
