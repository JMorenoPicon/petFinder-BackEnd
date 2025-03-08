export default {
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true, // Habilitar la recopilación de cobertura
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    transform: {
        '^.+\\.js$': 'babel-jest',  // Transforma los archivos .js usando babel-jest
    },
};
