import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useDeviceLanguage } from '@/shared/i18n';

export default function RootLayout() {
  useDeviceLanguage();

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
