const { executeQuery } = require('./dist/config/database.js');

async function checkAdminPassword() {
  try {
    console.log('Verificando información del usuario admin...');
    
    const adminUser = await executeQuery('SELECT id, nombre, email, documento, password_hash FROM usuarios WHERE email = "admin@oxitrans.com"');
    if (adminUser.length > 0) {
      console.log('Usuario admin encontrado:');
      console.log('ID:', adminUser[0].id);
      console.log('Nombre:', adminUser[0].nombre);
      console.log('Email:', adminUser[0].email);
      console.log('Documento:', adminUser[0].documento);
      console.log('Tiene password hash:', !!adminUser[0].password_hash);
    } else {
      console.log('No se encontró usuario admin');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAdminPassword();
