// ====================================
// 🧪 SWEETALERT2 TEST SCRIPT
// Script para probar las funcionalidades de SweetAlert2
// ====================================

import Swal from 'sweetalert2';

// Test de confirmación básica
export const testBasicConfirmation = () => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡Esta es una acción que no se puede deshacer!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        '¡Confirmado!',
        'La acción se ha ejecutado correctamente.',
        'success'
      );
    }
  });
};

// Test de mensaje de éxito
export const testSuccessMessage = () => {
  Swal.fire({
    title: '¡Éxito!',
    text: 'La operación se completó correctamente',
    icon: 'success',
    confirmButtonText: 'Entendido',
    timer: 3000,
    timerProgressBar: true
  });
};

// Test de mensaje de error
export const testErrorMessage = () => {
  Swal.fire({
    title: '¡Error!',
    text: 'Algo salió mal. Por favor, inténtalo de nuevo.',
    icon: 'error',
    confirmButtonText: 'Reintentar',
    showCancelButton: true,
    cancelButtonText: 'Cancelar'
  });
};

// Test de toast notification
export const testToastNotification = () => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: 'success',
    title: 'Notificación de prueba'
  });
};

// Test de entrada personalizada
export const testCustomInput = () => {
  Swal.fire({
    title: 'Ingresa tu comentario',
    input: 'textarea',
    inputLabel: 'Comentario',
    inputPlaceholder: 'Escribe tu comentario aquí...',
    inputAttributes: {
      'aria-label': 'Escribe tu comentario aquí'
    },
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Necesitas escribir algo!';
      }
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(`Comentario guardado: ${result.value}`);
    }
  });
};

// Test del flujo completo de jornada laboral
export const testJornadaWorkflow = () => {
  // Simular inicio de jornada
  Swal.fire({
    title: '🌅 Iniciar Jornada Laboral',
    text: '¿Estás seguro que quieres registrar tu entrada?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: '✅ Sí, iniciar jornada',
    cancelButtonText: '❌ Cancelar',
    reverseButtons: true,
    customClass: {
      confirmButton: 'swal2-confirm-jornada',
      cancelButton: 'swal2-cancel-jornada'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Mostrar éxito
      Swal.fire({
        title: '✨ ¡Jornada Iniciada!',
        text: `Entrada registrada el ${new Date().toLocaleString()}`,
        icon: 'success',
        confirmButtonText: 'Continuar',
        timer: 2500,
        timerProgressBar: true
      });
    }
  });
};

// Test de todos los tipos de jornada
export const testAllJornadaActions = async () => {
  const actions = [
    { type: 'entrada', title: '🌅 Iniciar Jornada', text: '¿Registrar entrada?' },
    { type: 'descanso_manana_inicio', title: '☕ Iniciar Descanso AM', text: '¿Iniciar descanso matutino?' },
    { type: 'descanso_manana_fin', title: '🔄 Terminar Descanso AM', text: '¿Terminar descanso matutino?' },
    { type: 'almuerzo_inicio', title: '🍽️ Iniciar Almuerzo', text: '¿Iniciar hora de almuerzo?' },
    { type: 'almuerzo_fin', title: '⚡ Terminar Almuerzo', text: '¿Terminar hora de almuerzo?' },
    { type: 'descanso_tarde_inicio', title: '🌅 Iniciar Descanso PM', text: '¿Iniciar descanso vespertino?' },
    { type: 'descanso_tarde_fin', title: '💪 Terminar Descanso PM', text: '¿Terminar descanso vespertino?' },
    { type: 'salida', title: '🏠 Finalizar Jornada', text: '¿Registrar salida?' }
  ];

  for (const action of actions) {
    const result = await Swal.fire({
      title: action.title,
      text: action.text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Saltar',
      position: 'center'
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: '✅ Registrado',
        text: `${action.title} registrado correctamente`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }

    if (result.isDismissed) break;
  }
};

// Función para agregar botones de prueba al DOM
export const addTestButtonsToPage = () => {
  const testContainer = document.createElement('div');
  testContainer.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; z-index: 9999; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 15px 0; color: #333;">🧪 SweetAlert2 Tests</h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button id="test-basic" style="padding: 8px 12px; border: none; background: #007bff; color: white; border-radius: 5px; cursor: pointer;">Confirmación Básica</button>
        <button id="test-success" style="padding: 8px 12px; border: none; background: #28a745; color: white; border-radius: 5px; cursor: pointer;">Mensaje Éxito</button>
        <button id="test-error" style="padding: 8px 12px; border: none; background: #dc3545; color: white; border-radius: 5px; cursor: pointer;">Mensaje Error</button>
        <button id="test-toast" style="padding: 8px 12px; border: none; background: #17a2b8; color: white; border-radius: 5px; cursor: pointer;">Toast Notification</button>
        <button id="test-input" style="padding: 8px 12px; border: none; background: #6f42c1; color: white; border-radius: 5px; cursor: pointer;">Input Personalizado</button>
        <button id="test-jornada" style="padding: 8px 12px; border: none; background: #fd7e14; color: white; border-radius: 5px; cursor: pointer;">Flujo Jornada</button>
        <button id="test-all" style="padding: 8px 12px; border: none; background: #e83e8c; color: white; border-radius: 5px; cursor: pointer;">Todas las Acciones</button>
        <button id="close-tests" style="padding: 8px 12px; border: none; background: #6c757d; color: white; border-radius: 5px; cursor: pointer;">Cerrar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(testContainer);

  // Event listeners
  document.getElementById('test-basic')?.addEventListener('click', testBasicConfirmation);
  document.getElementById('test-success')?.addEventListener('click', testSuccessMessage);
  document.getElementById('test-error')?.addEventListener('click', testErrorMessage);
  document.getElementById('test-toast')?.addEventListener('click', testToastNotification);
  document.getElementById('test-input')?.addEventListener('click', testCustomInput);
  document.getElementById('test-jornada')?.addEventListener('click', testJornadaWorkflow);
  document.getElementById('test-all')?.addEventListener('click', testAllJornadaActions);
  document.getElementById('close-tests')?.addEventListener('click', () => {
    document.body.removeChild(testContainer);
  });
};

// Auto-ejecutar en desarrollo
if (import.meta.env?.DEV) {
  console.log('🧪 SweetAlert2 Test Functions loaded!');
  console.log('Available functions:');
  console.log('- testBasicConfirmation()');
  console.log('- testSuccessMessage()');
  console.log('- testErrorMessage()');
  console.log('- testToastNotification()');
  console.log('- testCustomInput()');
  console.log('- testJornadaWorkflow()');
  console.log('- testAllJornadaActions()');
  console.log('- addTestButtonsToPage()');
  
  // Hacer funciones disponibles globalmente para testing en consola
  (window as any).SweetAlert2Tests = {
    testBasicConfirmation,
    testSuccessMessage,
    testErrorMessage,
    testToastNotification,
    testCustomInput,
    testJornadaWorkflow,
    testAllJornadaActions,
    addTestButtonsToPage
  };
}