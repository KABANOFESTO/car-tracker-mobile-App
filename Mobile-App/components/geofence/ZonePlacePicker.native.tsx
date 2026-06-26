import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Circle, Marker, MapPressEvent, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { FLEET_COLORS } from '@/constants/theme';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Props {
  vehicleName?: string;
  vehicleLocation?: Coordinate | null;
  center: Coordinate | null;
  radius: number;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectCenter: (coords: Coordinate) => void;
  onUseVehicleLocation: () => void;
  primaryActionLabel?: string;
  actionLoading?: boolean;
}

const DEFAULT_REGION: Region = {
  latitude: -26.2041,
  longitude: 28.0473,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function ZonePlacePicker({
  vehicleName,
  vehicleLocation,
  center,
  radius,
  query,
  onQueryChange,
  onSelectCenter,
  onUseVehicleLocation,
  primaryActionLabel = 'Use vehicle',
  actionLoading = false,
}: Props) {
  const mapRef = useRef<MapView | null>(null);
  const [searching, setSearching] = useState(false);
  const [reverseLabel, setReverseLabel] = useState('Tap the map or search a place');

  const mapRegion = useMemo<Region>(() => {
    if (center) {
      return {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
    }
    if (vehicleLocation) {
      return {
        latitude: vehicleLocation.latitude,
        longitude: vehicleLocation.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
    }
    return DEFAULT_REGION;
  }, [center, vehicleLocation]);

  useEffect(() => {
    if (!center) return;
    Location.reverseGeocodeAsync(center)
      .then((places) => {
        const place = places[0];
        if (!place) {
          setReverseLabel(`${center.latitude.toFixed(5)}, ${center.longitude.toFixed(5)}`);
          return;
        }
        const parts = [place.name, place.street, place.city, place.region].filter(Boolean);
        setReverseLabel(parts.length > 0 ? parts.join(', ') : `${center.latitude.toFixed(5)}, ${center.longitude.toFixed(5)}`);
      })
      .catch(() => {
        setReverseLabel(`${center.latitude.toFixed(5)}, ${center.longitude.toFixed(5)}`);
      });
  }, [center]);

  async function searchPlace() {
    const term = query.trim();
    if (!term) {
      Alert.alert('Search place', 'Type a place, area, or address first.');
      return;
    }

    setSearching(true);
    try {
      const results = await Location.geocodeAsync(term);
      if (!results.length) {
        Alert.alert('No results', 'Try a more specific place name or address.');
        return;
      }

      const next = { latitude: results[0].latitude, longitude: results[0].longitude };
      onSelectCenter(next);
      mapRef.current?.animateToRegion({ ...next, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 450);
    } catch {
      Alert.alert('Search failed', 'Could not find that place right now.');
    } finally {
      setSearching(false);
    }
  }

  function handleMapPress(event: MapPressEvent) {
    const next = event.nativeEvent.coordinate;
    onSelectCenter(next);
    mapRef.current?.animateToRegion({ ...next, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 350);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Zone location picker</Text>
          <Text style={styles.subtitle}>
            Search a place, tap the map, or use the exact location source to place this geofence.
          </Text>
        </View>
        <Pressable style={styles.vehicleBtn} onPress={onUseVehicleLocation} disabled={actionLoading}>
          {actionLoading ? (
            <ActivityIndicator size="small" color={FLEET_COLORS.primary} />
          ) : (
            <Ionicons name="car-sport-outline" size={14} color={FLEET_COLORS.primary} />
          )}
          <Text style={styles.vehicleBtnText}>{actionLoading ? 'Locating...' : primaryActionLabel}</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search any place or address"
          placeholderTextColor={FLEET_COLORS.textSecondary + '88'}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={searchPlace}
        />
        <Pressable style={styles.searchBtn} onPress={searchPlace} disabled={searching}>
          {searching ? <ActivityIndicator color="#fff" /> : <Ionicons name="search" size={16} color="#fff" />}
        </Pressable>
      </View>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          onPress={handleMapPress}
          showsCompass={false}
          showsScale={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          customMapStyle={DARK_MAP_STYLE}
        >
          {vehicleLocation ? (
            <Marker coordinate={vehicleLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.vehicleMarker}>
                <Ionicons name="car-sport" size={16} color="#FFFFFF" />
              </View>
            </Marker>
          ) : null}

          {center ? (
            <>
              <Circle
                center={center}
                radius={radius}
                strokeColor={FLEET_COLORS.primary}
                fillColor={`${FLEET_COLORS.primary}20`}
                strokeWidth={2}
              />
              <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.centerMarker}>
                  <View style={styles.centerGlow} />
                  <View style={styles.centerPin}>
                    <Ionicons name="location" size={18} color="#fff" />
                  </View>
                </View>
              </Marker>
            </>
          ) : null}
        </MapView>

        <View style={styles.mapHud}>
          <Text style={styles.mapHudLabel}>Selected center</Text>
          <Text style={styles.mapHudValue}>{center ? `${center.latitude.toFixed(6)}, ${center.longitude.toFixed(6)}` : 'Tap the map to place the zone'}</Text>
          <Text style={styles.mapHudHint}>{vehicleName ? `Vehicle reference: ${vehicleName}` : reverseLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0B0E27' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#AEB7D6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B0E27' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2D3561' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#182042' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2D3561' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#11183A' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#091122' }] },
];

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FLEET_COLORS.border,
    backgroundColor: FLEET_COLORS.surface,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleWrap: { flex: 1, gap: 3 },
  title: { color: FLEET_COLORS.textPrimary, fontSize: 15, fontWeight: '800' },
  subtitle: { color: FLEET_COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  vehicleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: FLEET_COLORS.primary + '55',
    backgroundColor: FLEET_COLORS.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  vehicleBtnText: { color: FLEET_COLORS.primary, fontSize: 12, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FLEET_COLORS.border,
    backgroundColor: FLEET_COLORS.background,
    color: FLEET_COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FLEET_COLORS.primary,
  },
  mapWrap: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FLEET_COLORS.border,
  },
  vehicleMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: FLEET_COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  centerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGlow: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: FLEET_COLORS.primary + '24',
  },
  centerPin: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FLEET_COLORS.primary,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  mapHud: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: 12,
  },
  mapHudLabel: {
    color: FLEET_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mapHudValue: {
    color: FLEET_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  mapHudHint: {
    color: FLEET_COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15,
  },
});
