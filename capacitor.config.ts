import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.833cdf2ac4c643569849bbd6a31af2e5',
  appName: 'LuxInnovate Interiors',
  webDir: 'dist',
  server: {
    url: 'https://833cdf2a-c4c6-4356-9849-bbd6a31af2e5.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
