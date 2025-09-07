const ghpages = require('gh-pages');
const path = require('path');

console.log('🚀 Iniciando deployment a GitHub Pages...');

ghpages.publish(
  'dist',
  {
    dotfiles: true,
    dest: '.',
    add: false,
    silent: false,
    message: 'Deploy: Actualización automática del sistema OXITRANS'
  },
  function (err) {
    if (err) {
      console.error('❌ Error durante el deployment:', err);
      process.exit(1);
    } else {
      console.log('✅ ¡Deployment exitoso! 🎉');
      console.log('🌐 Tu aplicación está disponible en: https://dorodrig.github.io/proyectooxitrans');
    }
  }
);
