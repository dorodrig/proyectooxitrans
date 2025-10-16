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

// Importar servicios
import { emailService } from './services/emailService';
import { taskScheduler } from './services/taskSchedulerService';

// Importar rutas
import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import registrosRoutes from './routes/registros';
import cargosRoutes from './routes/cargos';
import regionalesRoutes from './routes/regionales';
import novedadesRoutes from './routes/novedades';
import jornadasRoutes from './routes/jornadas';
import jornadaConfigRoutes from './routes/jornadaConfig';
import colaboradoresRoutes from './routes/colaboradores';
import reportesRoutes from './routes/reportes';

// Cargar variables de entorno
dotenv.config();

const app = express();
      const PORT = process.env.PORT || 3002;// Middleware de seguridad
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
  'http://localhost:5174', // Puerto Vite alternativo
  'http://localhost:3000',
  'http://localhost',     // Para EC2 local
  'http://127.0.0.1',     // Para EC2 local
  'http://ec2-18-218-166-209.us-east-2.compute.amazonaws.com',
  'https://ec2-18-218-166-209.us-east-2.compute.amazonaws.com'
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

// DEBUG: Middleware para capturar todos los requests
app.use((req, res, next) => {
  console.log('🌐 [SERVER] Request:', req.method, req.path);
  console.log('📋 [SERVER] Headers:', req.headers);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// DEBUG: Middleware para ver el body parseado
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('💾 [SERVER] Body parseado:', req.body);
  }
  next();
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../../dist');
  console.log(`📁 [server] Sirviendo archivos estáticos desde: ${distPath}`);
  app.use(express.static(distPath));
}

// Rutas principales de la API
// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/cargos', cargosRoutes);
app.use('/api/regionales', regionalesRoutes);
app.use('/api/novedades', novedadesRoutes);
app.use('/api/jornadas', jornadasRoutes);
app.use('/api/jornada-config', jornadaConfigRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/reportes', reportesRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors_origins: allowedOrigins
  });
});

// Ruta de debug para jornada (solo en desarrollo)
app.get('/api/debug/jornada/:usuarioId?', async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId || '1';
    const { pool } = await import('./config/database');
    
    const [jornada] = await pool.execute(`
      SELECT 
        *,
        DATE_FORMAT(entrada, '%Y-%m-%d %H:%i:%s') as entrada_formatted,
        DATE_FORMAT(almuerzo_inicio, '%Y-%m-%d %H:%i:%s') as almuerzo_inicio_formatted
      FROM jornadas_laborales 
      WHERE usuario_id = ? AND fecha = CURDATE()
    `, [usuarioId]);
    
    res.json({
      success: true,
      debug_info: {
        usuario_id: usuarioId,
        timestamp_server: new Date().toISOString(),
        timestamp_colombia: new Date().toLocaleString('es-CO', {
          timeZone: 'America/Bogota',
          hour12: false
        }),
        jornada_data: jornada
      }
    });
  } catch (error) {
    console.error('Error en debug jornada:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
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
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      registros: '/api/registros',
      cargos: '/api/cargos',
      regionales: '/api/regionales',
      novedades: '/api/novedades'
    },
    documentation: 'API REST para el sistema de control de acceso'
  });
});

// Middleware para manejar rutas API no encontradas
app.use('/api/*', (req, res) => {
  console.log(`🚫 [server] Ruta API no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    endpoint: req.originalUrl
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
    
    // Verificar configuración de email
    console.log('📧 Verificando configuración de email...');
    const emailConfigValid = await emailService.verificarConfiguracion();
    if (!emailConfigValid) {
      console.warn('⚠️ Configuración de email no válida - las notificaciones por email no funcionarán');
    }
    
    // Inicializar servicios programados
    console.log('⏰ Servicios programados inicializados');
    // taskScheduler ya se inicializa automáticamente al importarse
    
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
