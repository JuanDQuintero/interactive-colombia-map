import 'dotenv/config'; // Carga las variables de .env
import { type Request, type Response } from 'express';
import pg from 'pg';

// Configuración de la conexión a la base de datos
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export const getAllDepartments = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM departments ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAttractionsByDepartment = async (req: Request, res: Response) => {
    try {
        const { departmentId } = req.params;
        const result = await pool.query(
            'SELECT * FROM attractions WHERE department_id = $1',
            [departmentId.toUpperCase()]
        );

        // Ya no es necesario comprobar si hay resultados, la DB devuelve un array vacío
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
