const { executeQuery } = require('./dist/config/database.js');

async function testUsers() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Contar total de usuarios
    const countResult = await executeQuery('SELECT COUNT(*) as count FROM usuarios');
    console.log('Total usuarios en la base de datos:', countResult[0].count);
    
    // Buscar usuario admin
    const adminUsers = await executeQuery('SELECT id, nombre, apellido, email, rol FROM usuarios WHERE rol = "admin" LIMIT 1');
    if (adminUsers.length > 0) {
      console.log('Usuario admin encontrado:', adminUsers[0]);
    } else {
      console.log('No se encontró usuario admin');
    }
    
    // Mostrar primeros 5 usuarios
    const users = await executeQuery('SELECT id, nombre, apellido, email, rol FROM usuarios LIMIT 5');
    console.log('Primeros 5 usuarios:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Nombre: ${user.nombre} ${user.apellido}, Email: ${user.email}, Rol: ${user.rol}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testUsers();
