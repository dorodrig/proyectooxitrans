import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_acceso_oxitrans',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'local'
};

// Pool de conexiones
export const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
};

// Función para ejecutar queries
export const executeQuery = async (query: string, params?: unknown[]): Promise<mysql.RowDataPacket[]> => {
  try {
    const [results] = await pool.execute<mysql.RowDataPacket[]>(query, params);
    return results;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
};

// Función para ejecutar INSERT/UPDATE/DELETE queries
export const executeInsertQuery = async (query: string, params?: unknown[]): Promise<mysql.ResultSetHeader> => {
  try {
    const [result] = await pool.execute<mysql.ResultSetHeader>(query, params);
    return result;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
};

// Función para transacciones
export const executeTransaction = async (
  queries: { query: string; params?: unknown[] }[]
): Promise<mysql.ResultSetHeader[]> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const results: mysql.ResultSetHeader[] = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute<mysql.ResultSetHeader>(query, params);
      results.push(result);
    }

    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;
