export default [
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
        },
        linterOptions: {
            reportUnusedDisableDirectives: true
        },
        rules: {
            indent: ['error', 4], // Indentación de 4 espacios
            'linebreak-style': ['error', 'unix'], // Saltos de línea tipo Unix
            quotes: ['error', 'single'], // Comillas simples
            semi: ['error', 'always'], // Punto y coma obligatorio
            'no-console': 'warn', // Advertencia para console.log
            'no-unused-vars': 'warn', // Advertencia para variables sin uso
            'prefer-template': 'error', // Usar template strings
        }
    }
];
