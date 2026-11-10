import express, { NextFunction, Request, Response } from 'express';
import sesionRoutes from './components/sesiones/sesion.routes';

const app = express();

app.use(express.json()); // permite leer el body en JSON

app.use('/api/sesiones', sesionRoutes);

// Cualquier ruta que no exista
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
});

// Errores que no atrapó ningún controlador (por ejemplo, un JSON mal escrito en el body)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'El body no es un JSON válido' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
