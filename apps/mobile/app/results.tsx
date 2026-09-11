import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type { RoutePlanResult, SimulationTimeline } from '@econav/core';
import { DEFAULT_DEPOT, ROUTE_COLORS } from '../lib/defaults';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ plan: string; simulation: string }>();

  const plan: RoutePlanResult = params.plan ? JSON.parse(params.plan) : null;
  const simulation: SimulationTimeline = params.simulation
    ? JSON.parse(params.simulation)
    : null;

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text>No plan data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: DEFAULT_DEPOT.lat,
            longitude: DEFAULT_DEPOT.lng,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }}
        >
          <Marker
            coordinate={{ latitude: DEFAULT_DEPOT.lat, longitude: DEFAULT_DEPOT.lng }}
            title={DEFAULT_DEPOT.name}
            pinColor="#0f766e"
          />
          {plan.routes.flatMap((route) =>
            route.stops.map((stop) => (
              <Marker
                key={stop.siteId}
                coordinate={{ latitude: stop.lat, longitude: stop.lng }}
                title={stop.siteName}
                description={`${stop.demandKg} kg`}
                pinColor="#dc2626"
              />
            )),
          )}
          {plan.routes.map((route, idx) =>
            route.path.length > 1 ? (
              <Polyline
                key={route.vehicleId}
                coordinates={route.path.map((p) => ({
                  latitude: p.lat,
                  longitude: p.lng,
                }))}
                strokeColor={ROUTE_COLORS[idx % ROUTE_COLORS.length]}
                strokeWidth={3}
              />
            ) : null,
          )}
        </MapView>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Summary</Text>
        <Text style={styles.stat}>Vehicles used: {plan.summary.totalVehiclesUsed}</Text>
        <Text style={styles.stat}>Sites assigned: {plan.summary.totalSitesAssigned}</Text>
        <Text style={styles.stat}>Total distance: {plan.summary.totalDistanceKm} km</Text>
        <Text style={styles.stat}>
          Duration: {Math.round(plan.summary.totalDurationMinutes)} min
        </Text>
        <Text style={styles.stat}>Est. cost: ₹{plan.summary.totalCost}</Text>
        <Text style={styles.stat}>
          Utilization: {plan.summary.averageVehicleUtilization}%
        </Text>
      </View>

      {plan.routes
        .filter((r) => r.stops.length > 0)
        .map((route) => (
          <View key={route.vehicleId} style={styles.card}>
            <Text style={styles.routeTitle}>{route.vehicleName}</Text>
            <Text style={styles.stat}>
              {route.stops.length} stops · {route.totalDistanceKm} km · {route.totalLoadKg}/
              {route.vehicleCapacityKg} kg
            </Text>
            <Text style={styles.routeStops}>
              {route.stops.map((s) => s.siteName).join(' → ')}
            </Text>
          </View>
        ))}

      {simulation && (
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: '/simulation',
              params: { simulation: JSON.stringify(simulation) },
            })
          }
        >
          <Text style={styles.buttonText}>Run Simulation</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa' },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapWrapper: {
    height: 240,
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0f766e', marginBottom: 8 },
  routeTitle: { fontSize: 16, fontWeight: '600', color: '#134e4a', marginBottom: 4 },
  stat: { fontSize: 14, color: '#134e4a', marginBottom: 4 },
  routeStops: { fontSize: 12, color: '#64748b', marginTop: 4 },
  button: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
