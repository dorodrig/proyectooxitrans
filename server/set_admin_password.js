const { executeQuery } = require('./dist/config/database.js');
const bcrypt = require('bcryptjs');

async function setAdminPassword() {
  try {
    console.log('Estableciendo contraseña "admin123" para el usuario admin...');
    
    // Hash de la contraseña
    const password = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('Password hasheada:', hashedPassword);
    
    // Actualizar la contraseña en la base de datos
    const updateQuery = `UPDATE usuarios SET password_hash = "${hashedPassword}" WHERE email = "admin@oxitrans.com"`;
    await executeQuery(updateQuery);
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('Ahora puedes hacer login con:');
    console.log('Email: admin@oxitrans.com');
    console.log('Contraseña: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setAdminPassword();
