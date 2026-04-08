import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Animated, StyleSheet, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const TOKEN = "b0d535a0af926f66433def6d5c1d21877312f7e6";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userCity, setUserCity] = useState('Detecting location...');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchAQI = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      let url = `https://api.waqi.info/feed/kolkata/?token=${TOKEN}`;
      
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        url = `https://api.waqi.info/feed/geo:${loc.coords.latitude};${loc.coords.longitude}/?token=${TOKEN}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      setData(json.data);
      setUserCity(json.data.city.name.split(',')[0]);
      
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAQI(); }, []);

  const aqi = data?.aqi || 0;
  const getStatusColor = (val: number) => val <= 50 ? '#2dd4bf' : val <= 100 ? '#fbbf24' : '#f87171';

  return (
    <LinearGradient colors={['#0f172a', '#134e4a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>SkyPure</Text>
              <Text style={styles.headerSubtitle}>📍 {userCity}</Text>
            </View>
            <TouchableOpacity onPress={fetchAQI} style={styles.refreshCircle}>
               <Ionicons name="refresh" size={20} color="#2dd4bf" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2dd4bf" style={{ marginTop: 100 }} />
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              
              <View style={styles.mainAqiCard}>
                <Text style={styles.aqiLabel}>Current AQI</Text>
                <Text style={[styles.aqiValue, { color: getStatusColor(aqi) }]}>{aqi}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(aqi) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(aqi) }]}>
                    {aqi <= 50 ? 'EXCELLENT' : aqi <= 100 ? 'MODERATE' : 'UNHEALTHY'}
                  </Text>
                </View>
              </View>

              {/* FIRST GRAPH: LINEAR TREND */}
              <Text style={styles.sectionTitle}>Atmospheric Trend</Text>
              <View style={styles.graphContainer}>
                <TrendGraph color={getStatusColor(aqi)} />
                <View style={styles.graphLabels}>
                  <Text style={styles.graphTime}>6 AM</Text>
                  <Text style={styles.graphTime}>NOW</Text>
                  <Text style={styles.graphTime}>6 PM</Text>
                </View>
              </View>

              {/* SECOND GRAPH: CIRCULAR DISTRIBUTION GAUGE */}
              <Text style={styles.sectionTitle}>Pollutant Balance</Text>
              <View style={styles.gaugeCard}>
                <NeuralGauge aqi={aqi} color={getStatusColor(aqi)} />
                <View style={styles.gaugeInfo}>
                    <Text style={styles.gaugeTitle}>Environment Load</Text>
                    <Text style={styles.gaugeDesc}>Real-time analysis of particulate saturation in your immediate vicinity.</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <MetricBox icon="water" label="Humidity" val={data?.iaqi?.h?.v} unit="%" color="#38bdf8" />
                <MetricBox icon="thermometer" label="Temp" val={data?.iaqi?.t?.v} unit="°C" color="#fb923c" />
                <MetricBox icon="speedometer" label="Pressure" val={data?.iaqi?.p?.v} unit="hPa" color="#a78bfa" />
                <MetricBox icon="sunny" label="UV Index" val="4.2" unit="UV" color="#fbbf24" />
              </View>

              <Text style={styles.sectionTitle}>Neural Analysis</Text>
              <View style={styles.pollutantGrid}>
                <PollutantRow label="PM 2.5 (Fine Dust)" val={data?.iaqi?.pm25?.v} color="#2dd4bf" max={200} />
                <PollutantRow label="PM 10 (Coarse Dust)" val={data?.iaqi?.pm10?.v} color="#fbbf24" max={200} />
                <PollutantRow label="NO2 (Nitrogen Dioxide)" val={data?.iaqi?.no2?.v} color="#a78bfa" max={100} />
                <PollutantRow label="O3 (Ozone Layer)" val={data?.iaqi?.o3?.v} color="#f472b6" max={100} />
              </View>

            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// GRAPH 1: TREND LINE
const TrendGraph = ({ color }: { color: string }) => (
  <Svg height="80" width={width - 80}>
    <Defs>
      <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor={color} stopOpacity="0.3" />
        <Stop offset="1" stopColor={color} stopOpacity="0" />
      </SvgGradient>
    </Defs>
    <Path d="M0 60 Q 40 10, 80 50 T 160 30 T 240 60 T 320 20" fill="none" stroke={color} strokeWidth="3" />
    <Path d="M0 60 Q 40 10, 80 50 T 160 30 T 240 60 T 320 20 V 80 H 0 Z" fill="url(#grad)" />
  </Svg>
);

// GRAPH 2: CIRCULAR NEURAL GAUGE
const NeuralGauge = ({ aqi, color }: { aqi: number, color: string }) => {
  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(aqi / 300, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.gaugeWrapper}>
      <Svg height={size} width={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </Svg>
      <View style={styles.gaugeInnerLabel}>
        <Text style={[styles.gaugePercent, { color }]}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
};

// REUSABLE COMPONENTS
const MetricBox = ({ icon, label, val, unit, color }: any) => (
  <View style={styles.mBox}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={styles.mVal}>{val || '--'}<Text style={styles.mUnit}>{unit}</Text></Text>
    <Text style={styles.mLabel}>{label}</Text>
  </View>
);

const PollutantRow = ({ label, val, color, max }: any) => {
  const percentage = Math.min((val / max) * 100, 100) || 0;
  return (
    <View style={styles.glassRow}>
      <View style={{ flex: 1 }}>
        <View style={styles.rowTop}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={[styles.rowVal, { color }]}>{val || '--'}</Text>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  header: { marginTop: 30, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#2dd4bf', fontWeight: '600', textTransform: 'uppercase' },
  refreshCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  mainAqiCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 32, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 25 },
  aqiLabel: { color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  aqiValue: { fontSize: 100, fontWeight: '900', marginVertical: 10 },
  statusBadge: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontWeight: '800', fontSize: 12 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 15, marginTop: 10 },
  graphContainer: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, marginBottom: 25, alignItems: 'center' },
  graphLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  graphTime: { color: '#475569', fontSize: 10, fontWeight: '700' },

  // GAUGE STYLES
  gaugeCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, marginBottom: 25, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  gaugeWrapper: { justifyContent: 'center', alignItems: 'center' },
  gaugeInnerLabel: { position: 'absolute' },
  gaugePercent: { fontSize: 18, fontWeight: '900' },
  gaugeInfo: { marginLeft: 20, flex: 1 },
  gaugeTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  gaugeDesc: { color: '#64748b', fontSize: 11, lineHeight: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  mBox: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  mVal: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 8 },
  mUnit: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  mLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', marginTop: 2 },
  pollutantGrid: { gap: 12 },
  glassRow: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 18, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { color: '#94a3b8', fontWeight: '700', fontSize: 12 },
  rowVal: { fontSize: 16, fontWeight: '800' },
  barBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 }
});