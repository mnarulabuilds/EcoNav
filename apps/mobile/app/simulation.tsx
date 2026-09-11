import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { SimulationTimeline } from '@econav/core';

export default function SimulationScreen() {
  const params = useLocalSearchParams<{ simulation: string }>();
  const simulation: SimulationTimeline | null = params.simulation
    ? JSON.parse(params.simulation)
    : null;

  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || !simulation) return;

    const timer = setInterval(() => {
      setIndex((prev) => {
        if (prev >= simulation.events.length - 1) {
          setRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(timer);
  }, [running, simulation]);

  if (!simulation) {
    return (
      <View style={styles.center}>
        <Text>No simulation data.</Text>
      </View>
    );
  }

  const visibleEvents = simulation.events.slice(0, index + 1);
  const current = simulation.events[index];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.log} contentContainerStyle={styles.logContent}>
        {visibleEvents.map((event, i) => (
          <Text key={i} style={styles.logLine}>
            <Text style={styles.time}>[{event.timestampMinutes.toFixed(1)}m] </Text>
            {event.message}
          </Text>
        ))}
      </ScrollView>

      {current && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {current.vehicleName} · Load: {current.loadKg} kg
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIndex(0);
            setRunning(true);
          }}
          disabled={running}
        >
          <Text style={styles.buttonText}>{running ? 'Running...' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            setIndex(0);
            setRunning(false);
          }}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e293b' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  log: { flex: 1 },
  logContent: { padding: 16 },
  logLine: { color: '#e2e8f0', fontSize: 13, lineHeight: 20, marginBottom: 6 },
  time: { color: '#14b8a6', fontWeight: '600' },
  statusBar: {
    backgroundColor: '#0f766e',
    padding: 12,
  },
  statusText: { color: '#fff', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  controls: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#334155',
  },
  button: {
    flex: 1,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#64748b',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondaryText: { color: '#e2e8f0' },
});
