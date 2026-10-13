import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'autofloodalert',
  appName: 'automatic flood alert',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
