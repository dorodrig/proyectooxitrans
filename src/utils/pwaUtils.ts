// PWA Installation utilities
import Swal from 'sweetalert2';

let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e: Event) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Save the event so it can be triggered later
  deferredPrompt = e as BeforeInstallPromptEvent;
  
  // Show install button or notification
  showInstallPromotion();
});

function showInstallPromotion() {
  // Only show if not already installed
  if (!isAppInstalled()) {
    console.log('PWA installation available');
    
    // You can customize this to show a banner, button, etc.
    // For now, we'll just log it
  }
}

export function promptPWAInstall(): void {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        Swal.fire({
          title: '¡Aplicación Instalada!',
          text: 'OXITRANS se ha instalado correctamente en tu dispositivo',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        console.log('User dismissed the PWA install prompt');
      }
      deferredPrompt = null;
    });
  } else {
    // Fallback for browsers that don't support PWA installation
    Swal.fire({
      title: 'Instalar App',
      html: `
        <div style="text-align: left;">
          <p><strong>En Chrome/Edge:</strong></p>
          <p>• Haz clic en los 3 puntos (⋮) → "Instalar OXITRANS"</p>
          <br>
          <p><strong>En Safari (iOS):</strong></p>
          <p>• Toca el botón compartir → "Añadir a pantalla de inicio"</p>
          <br>
          <p><strong>En Firefox:</strong></p>
          <p>• Haz clic en el ícono de casa en la barra de direcciones</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#006445'
    });
  }
}

export function isAppInstalled(): boolean {
  // Check if app is installed
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: fullscreen)').matches ||
         (window.navigator as any).standalone === true;
}

export function isPWASupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Listen for app installed event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed successfully');
  Swal.fire({
    title: '¡Aplicación Instalada!',
    text: 'OXITRANS ya está disponible en tu dispositivo',
    icon: 'success',
    timer: 3000,
    showConfirmButton: false
  });
  deferredPrompt = null;
});

// Check if running as PWA
if (isAppInstalled()) {
  console.log('Running as PWA');
  document.body.setAttribute('data-pwa', 'true');
}

export default {
  promptPWAInstall,
  isAppInstalled,
  isPWASupported
};