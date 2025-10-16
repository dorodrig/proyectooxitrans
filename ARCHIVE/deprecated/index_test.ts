import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas simples
import authRoutes from './routes/auth_simple';
import usuariosRoutes from './routes/usuarios_simple';
import registrosRoutes from './routes/registros_simple';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS básico
app.use(cors());

// Middleware básico
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/registros', registrosRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
