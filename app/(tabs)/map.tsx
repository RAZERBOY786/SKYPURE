import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, StyleSheet, Text, ActivityIndicator, FlatList, 
  Dimensions, StatusBar, Pressable, RefreshControl, LayoutAnimation 
} from 'react-native';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have expo-icons installed

const { width } = Dimensions.get('window');
const TOKEN = "b0d535a0af926f66433def6d5c1d21877312f7e6"; 

export default function InteractiveAirList() {
  const [stations, setStations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lon } = location.coords;
      const delta = 0.5;

      const response = await fetch(
        `https://api.waqi.info/v2/map/bounds/?latlng=${lat - delta},${lon - delta},${lat + delta},${lon + delta}&token=${TOKEN}`
      );
      const json = await response.json();

      if (json.status === 'ok') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStations(json.data.slice(0, 10));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const getAQIProps = (aqi: string) => {
    const val = parseInt(aqi);
    if (val <= 50) return { label: "Good", color: "#2dd4bf", icon: "sunny", advice: "Perfect day for outdoor activities!" };
    if (val <= 100) return { label: "Moderate", color: "#fbbf24", icon: "partly-sunny", advice: "Sensitive groups should reduce exercise." };
    if (val <= 150) return { label: "Unhealthy", color: "#fb923c", icon: "cloudy", advice: "Wear a mask if you have asthma." };
    return { label: "Poor", color: "#ef4444", icon: "warning", advice: "Avoid prolonged outdoor exposure." };
  };

  const renderItem = ({ item }: { item: any }) => {
    const isExpanded = expandedId === item.uid;
    const props = getAQIProps(item.aqi);

    return (
      <Pressable 
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
          setExpandedId(isExpanded ? null : item.uid);
        }}
      >
        <BlurView intensity={isExpanded ? 40 : 15} tint="dark" style={[styles.card, isExpanded && styles.cardExpanded]}>
          <View style={styles.cardHeader}>
            <View style={styles.mainInfo}>
              <Text style={styles.locationName} numberOfLines={1}>{item.station.name}</Text>
              <View style={styles.statusRow}>
                <Ionicons name={props.icon as any} size={14} color={props.color} />
                <Text style={[styles.statusLabel, { color: props.color }]}>{props.label}</Text>
              </View>
            </View>
            
            <View style={[styles.aqiCircle, { borderColor: props.color }]}>
              <Text style={[styles.aqiNumber, { color: props.color }]}>{item.aqi}</Text>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.details}>
              <View style={styles.divider} />
              <Text style={styles.adviceTitle}>Health Advice:</Text>
              <Text style={styles.adviceText}>{props.advice}</Text>
              <Text style={styles.updateTime}>Last updated: {item.station.time}</Text>
            </View>
          )}
        </BlurView>
      </Pressable>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#2dd4bf" size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={stations}
        renderItem={renderItem}
        keyExtractor={(item) => item.uid.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2dd4bf" />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SkyPure Live</Text>
            <Text style={styles.headerSubtitle}>Tap a station for health tips</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020617' },
  list: { padding: 20 },
  header: { marginBottom: 25 },
  headerTitle: { color: '#f8fafc', fontSize: 32, fontWeight: '900' },
  headerSubtitle: { color: '#64748b', fontSize: 16 },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  cardExpanded: { borderColor: 'rgba(45, 212, 191, 0.3)', backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainInfo: { flex: 1 },
  locationName: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  aqiCircle: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  aqiNumber: { fontSize: 20, fontWeight: '900' },
  details: { marginTop: 15 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  adviceTitle: { color: '#2dd4bf', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 },
  adviceText: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
  updateTime: { color: '#475569', fontSize: 10, marginTop: 12, fontStyle: 'italic' }
});