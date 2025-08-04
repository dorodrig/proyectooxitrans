import { createPool } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

async function seed() {
  const pool = await createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'user2025+',
    database: process.env.DB_NAME || 'control_acceso_oxitrans',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const passwordHash = await bcrypt.hash('admin123', 10);

  const users = [
    {
      nombre: 'Admin',
      apellido: 'Principal',
      email: 'admin@oxitrans.com',
      telefono: '3001234567',
      documento: '10000001',
      tipo_documento: 'CC',
      rol: 'admin',
      estado: 'activo',
      fecha_ingreso: new Date(),
      departamento: 'Sistemas',
      cargo: 'Administrador',
      codigo_acceso: 'OXI-ADMIN',
      foto_url: '',
      password_hash: passwordHash,
    },
    {
      nombre: 'Empleado',
      apellido: 'Demo',
      email: 'empleado@oxitrans.com',
      telefono: '3007654321',
      documento: '10000002',
      tipo_documento: 'CC',
      rol: 'empleado',
      estado: 'activo',
      fecha_ingreso: new Date(),
      departamento: 'Operaciones',
      cargo: 'Operario',
      codigo_acceso: 'OXI-EMP',
      foto_url: '',
      password_hash: passwordHash,
    },
  ];

  for (const user of users) {
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE documento = ?', [user.documento]);
    if (Array.isArray(rows) && rows.length === 0) {
      await pool.query(
        `INSERT INTO usuarios (nombre, apellido, email, telefono, documento, tipo_documento, rol, estado, fecha_ingreso, departamento, cargo, codigo_acceso, foto_url, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          user.nombre,
          user.apellido,
          user.email,
          user.telefono,
          user.documento,
          user.tipo_documento,
          user.rol,
          user.estado,
          user.fecha_ingreso,
          user.departamento,
          user.cargo,
          user.codigo_acceso,
          user.foto_url,
          user.password_hash,
        ]
      );
      console.log(`Usuario ${user.nombre} creado.`);
    } else {
      console.log(`Usuario con documento ${user.documento} ya existe.`);
    }
  }

  await pool.end();
  console.log('Seed finalizado.');
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
