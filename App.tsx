import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Reader } from './src/reader/Reader';
import { createPreferenceStore, DEFAULT_PREFERENCES, Preferences } from './src/reader/preferences';

const store = createPreferenceStore(AsyncStorage);

export default function App() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [restoreFailed, setRestoreFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    store.load().then(saved => {
      if (mounted) setPreferences(saved);
    }).catch(() => {
      if (mounted) {
        setRestoreFailed(true);
        setPreferences(DEFAULT_PREFERENCES);
      }
    });
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        {preferences ? (
          <Reader initialPreferences={preferences} savePreferences={store.save} restoreFailed={restoreFailed} />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator color="#7c2f36" accessibilityLabel="Restoring reading preferences" />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#faf7f0' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
