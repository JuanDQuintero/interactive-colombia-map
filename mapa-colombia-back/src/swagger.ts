import type { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mapa Colombia API',
            version: '1.0.0',
            description: 'Una API simple para los atractivos turísticos de los departamentos de Colombia.',
        },
        servers: [
            {
                url: 'http://localhost:5000', // Asegúrate de que coincida con tu servidor
            },
        ],
    },
    // Apunta a los archivos que contienen la documentación de la API
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function swaggerDocs(app: Express, port: string | number) {
    // Ruta para la UI de Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Documentación en formato JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`✅ Documentación de la API disponible en http://localhost:${port}/api-docs`);
}
