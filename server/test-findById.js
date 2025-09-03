const { UsuarioModel } = require('./dist/models/UsuarioModel');
require('dotenv').config();

async function test() {
  console.log('Testeando UsuarioModel.findById...');
  
  try {
    const user1 = await UsuarioModel.findById('1');
    console.log('findById con string "1":', user1);
    
    const user2 = await UsuarioModel.findById(1);
    console.log('findById con number 1:', user2);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
