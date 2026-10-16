import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Stations of the Cross
      </Text>
      <Text style={styles.description}>
        A quiet space for prayer and reflection.
      </Text>
      <Text style={styles.note}>
        Prayers and station artwork will be included in a future update.
      </Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  title: {
    color: '#392b23',
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    color: '#51463e',
    fontSize: 18,
    textAlign: 'center',
  },
  note: {
    color: '#665a51',
    fontSize: 16,
    textAlign: 'center',
  },
});
