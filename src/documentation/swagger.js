import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Pet Finder API',
        version: '1.0.0',
        description: 'Documentación de la API de Pet Finder',
    },
    servers: [
        {
            url: '/api/v1',
            description: 'API base path'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{ bearerAuth: [] }]
};

const options = {
    swaggerDefinition,
    apis: [
        './src/routes/v1/*.js', // Documenta tus rutas aquí con JSDoc
        './src/models/*.js'
    ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
