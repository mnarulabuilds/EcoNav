import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { router } from 'expo-router';
import { planRoutes } from '../lib/api';
import {
  DEFAULT_DEPOT,
  DEFAULT_SITES,
  DEFAULT_VEHICLES,
  ROUTE_COLORS,
} from '../lib/defaults';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);

  const handlePlan = async () => {
    setLoading(true);
    try {
      const response = await planRoutes({
        depot: DEFAULT_DEPOT,
        sites: DEFAULT_SITES,
        vehicles: DEFAULT_VEHICLES,
        config: {
          criterion: 'balanced',
          serviceTimeMinutes: 10,
          costPerKm: 2.5,
          costPerHour: 500,
        },
      });

      router.push({
        pathname: '/results',
        params: {
          plan: JSON.stringify(response.plan),
          simulation: JSON.stringify(response.simulation),
        },
      });
    } catch (err) {
      Alert.alert(
        'Planning Failed',
        err instanceof Error ? err.message : 'Could not reach API. Start the API server first.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: DEFAULT_DEPOT.lat,
            longitude: DEFAULT_DEPOT.lng,
            latitudeDelta: 0.15,
            longitudeDelta: 0.15,
          }}
        >
          <Marker
            coordinate={{ latitude: DEFAULT_DEPOT.lat, longitude: DEFAULT_DEPOT.lng }}
            title={DEFAULT_DEPOT.name}
            description="Depot"
            pinColor="#0f766e"
          />
          {DEFAULT_SITES.map((site) => (
            <Marker
              key={site.id}
              coordinate={{ latitude: site.lat, longitude: site.lng }}
              title={site.name}
              description={`${site.demandKg} kg`}
              pinColor="#dc2626"
            />
          ))}
        </MapView>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Fleet Overview</Text>
        <Text style={styles.stat}>{DEFAULT_VEHICLES.length} vehicles available</Text>
        <Text style={styles.stat}>{DEFAULT_SITES.length} collection sites</Text>
        <Text style={styles.stat}>
          Total demand: {DEFAULT_SITES.reduce((s, site) => s + site.demandKg, 0)} kg
        </Text>
        <Text style={styles.stat}>
          Total capacity: {DEFAULT_VEHICLES.reduce((s, v) => s + v.capacityKg, 0)} kg
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePlan}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Plan Optimal Routes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa' },
  content: { padding: 16, paddingBottom: 32 },
  mapWrapper: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  map: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0f766e', marginBottom: 8 },
  stat: { fontSize: 14, color: '#134e4a', marginBottom: 4 },
  button: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
