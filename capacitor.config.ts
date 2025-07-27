import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oxitrans.controlacceso',
  appName: 'Control de Acceso OXITRANS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Geolocation: {
      permissions: {
        location: "when-in-use"
      }
    },
    Camera: {
      permissions: {
        camera: "camera"
      }
    }
  }
};

export default config;
