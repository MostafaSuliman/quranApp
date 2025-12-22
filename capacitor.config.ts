import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quran.hifz',
  appName: 'حفظ القرآن',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a472a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a472a'
    }
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#1a472a'
  },
  ios: {
    backgroundColor: '#1a472a',
    contentInset: 'always'
  }
};

export default config;
