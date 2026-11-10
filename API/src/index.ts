import 'dotenv/config'; // tiene que ir primero: carga las variables del .env
import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 3000;

const iniciar = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciar();
