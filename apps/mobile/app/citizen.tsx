import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchPlatformModules } from '../lib/platform-api';
import type { PlatformModuleMeta } from '@econav/platform';

export default function CitizenScreen() {
  const [modules, setModules] = useState<PlatformModuleMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformModules()
      .then((d) => setModules(d.modules))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0f766e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        CityConnect citizen modules (use web portal for full forms). API-backed catalog:
      </Text>
      {modules.map((m) => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.title}>
            {m.icon} {m.title}
          </Text>
          <Text style={styles.desc}>{m.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lead: { marginBottom: 12, color: '#134e4a' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderColor: '#99f6e4',
    borderWidth: 1,
  },
  title: { fontWeight: '700', color: '#0f766e', marginBottom: 4 },
  desc: { color: '#64748b', fontSize: 13 },
});
