import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

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
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="map-outline" size={18} color={FLEET_COLORS.primary} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Zone location picker</Text>
          <Text style={styles.subtitle}>
            Type a place, use the vehicle coordinates, or switch to the mobile map for exact tap placement.
          </Text>
        </View>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={onQueryChange}
          placeholder="Search any place or address"
          placeholderTextColor={FLEET_COLORS.textSecondary + '88'}
        />
        <TouchableOpacity style={styles.vehicleBtn} onPress={onUseVehicleLocation}>
          {actionLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.vehicleBtnText}>{primaryActionLabel}</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelLabel}>Selected center</Text>
        <Text style={styles.panelValue}>
          {center ? `${center.latitude.toFixed(6)}, ${center.longitude.toFixed(6)}` : 'No center selected yet'}
        </Text>
        <Text style={styles.panelHint}>
          {vehicleName
            ? `Vehicle reference: ${vehicleName}${vehicleLocation ? ` • ${vehicleLocation.latitude.toFixed(5)}, ${vehicleLocation.longitude.toFixed(5)}` : ''}`
            : 'Use the mobile app for precise map placement.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FLEET_COLORS.border,
    backgroundColor: FLEET_COLORS.surface,
    padding: 14,
  },
  header: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  headerText: { flex: 1, gap: 3 },
  title: { color: FLEET_COLORS.textPrimary, fontSize: 15, fontWeight: '800' },
  subtitle: { color: FLEET_COLORS.textSecondary, fontSize: 12, lineHeight: 17 },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FLEET_COLORS.border,
    backgroundColor: FLEET_COLORS.background,
    color: FLEET_COLORS.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  vehicleBtn: {
    borderRadius: 14,
    backgroundColor: FLEET_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  vehicleBtnText: { color: '#fff', fontWeight: '700' },
  panel: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FLEET_COLORS.border,
    backgroundColor: FLEET_COLORS.background,
    padding: 12,
    gap: 4,
  },
  panelLabel: {
    color: FLEET_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  panelValue: { color: FLEET_COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  panelHint: { color: FLEET_COLORS.textSecondary, fontSize: 11, lineHeight: 15 },
});
