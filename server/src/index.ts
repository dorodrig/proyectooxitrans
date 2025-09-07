import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

// Importar configuración de base de datos
import { testConnection } from './config/database';

// Importar rutas
import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import registrosRoutes from './routes/registros';
import cargosRoutes from './routes/cargos';

// Importar rutas opcionales (verificar existencia)
import { Router } from 'express';

let regionalesRoutes: Router | null = null;
let novedadesRoutes: Router | null = null;
let debugRoutes: Router | null = null;

try {
  regionalesRoutes = require('./routes/regionales').default;
} catch {
  console.warn('⚠️  Rutas de regionales no disponibles');
}

try {
  novedadesRoutes = require('./routes/novedades').default;
} catch {
  console.warn('⚠️  Rutas de novedades no disponibles');
}

try {
  debugRoutes = require('./routes/debug').default;
} catch {
  console.warn('⚠️  Rutas de debug no disponibles');
}

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
}));

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000', 
  'https://dorodrig.github.io'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware general
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../../dist')));
}

// Rutas principales de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/cargos', cargosRoutes);

// Rutas opcionales (solo si están disponibles)
if (regionalesRoutes) {
  app.use('/api/regionales', regionalesRoutes);
}

if (novedadesRoutes) {
  app.use('/api/novedades', novedadesRoutes);
}

if (debugRoutes) {
  app.use('/api/debug', debugRoutes);
}

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de bienvenida para backend
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 OXITRANS S.A.S - Sistema de Control de Acceso API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      registros: '/api/registros',
      cargos: '/api/cargos'
    },
    documentation: 'API REST para el sistema de control de acceso'
  });
});

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../dist/index.html'));
  });
}

// Middleware de manejo de errores
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor
const startServer = async (): Promise<void> => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
🚀 Servidor OXITRANS S.A.S iniciado correctamente

📍 URL: http://localhost:${PORT}
🌍 Entorno: ${process.env.NODE_ENV || 'development'}
📊 API Health: http://localhost:${PORT}/api/health
🔐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}

====================================
Sistema de Control de Acceso v1.0.0
OXITRANS S.A.S
====================================
      `);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de sistema
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

export default app;
