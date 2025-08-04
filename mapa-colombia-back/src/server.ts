import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import attractionRoutes from './routes/attractions.ts';
import { swaggerDocs } from './swagger.ts';

const app: Express = express();
const PORT: string | number = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', attractionRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('¡Bienvenido a la API del Mapa de Colombia!');
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    // Llama a la función para servir la documentación
    swaggerDocs(app, PORT);
});
