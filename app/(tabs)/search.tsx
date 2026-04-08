import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, StatusBar, ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-area-gradient';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { API_TOKEN as TOKEN } from '../../constants';
import { Ionicons } from '@expo/vector-icons';

export default function Search() {
  const [city, setCity] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const resultAnim = useRef(new Animated.Value(0)).current;

  const handleSearch = async () => {
    const query = city.trim();
    if (!query) return;
    setLoading(true);
    Keyboard.dismiss();
    resultAnim.setValue(0);

    try {
      const res = await fetch(`https://api.waqi.info/feed/${encodeURIComponent(query)}/?token=${TOKEN}`);
      const json = await res.json();
      if (json.status === 'ok') {
        setResult(json.data);
        Animated.spring(resultAnim, { toValue: 1, friction: 8, useNativeDriver: true }).start();
      } else {
        alert("Location not found.");
        setResult(null);
      }
    } catch (err) { alert("Network error."); } finally { setLoading(false); }
  };

  // Function to remove/clear results
  const handleRemove = () => {
    Animated.timing(resultAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setResult(null);
      setCity('');
    });
  };

  return (
    <ExpoGradient colors={['#0f172a', '#134e4a']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Text style={styles.headerTitle}>Global Search</Text>
            
            <View style={styles.searchWrapper}>
              <TextInput 
                placeholder="Search city..." 
                placeholderTextColor="#64748b" 
                value={city} 
                onChangeText={setCity} 
                style={styles.input} 
                onSubmitEditing={handleSearch} 
              />
              
              {/* Inline Clear Button for Input */}
              {city.length > 0 && (
                <TouchableOpacity onPress={() => setCity('')} style={{ marginRight: 10 }}>
                  <Ionicons name="close-circle" size={20} color="#64748b" />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleSearch} disabled={loading}>
                <ExpoGradient colors={['#2dd4bf', '#0d9488']} style={styles.searchButton}>
                  {loading ? <ActivityIndicator size="small" color="#0f172a" /> : <Text style={styles.buttonText}>Check</Text>}
                </ExpoGradient>
              </TouchableOpacity>
            </View>

            {result && (
              <View>
                <Animated.View style={[styles.resultCard, { opacity: resultAnim, transform: [{ scale: resultAnim }] }]}>
                  <Text style={styles.cityName}>📍 {result.city.name}</Text>
                  <Text style={[styles.aqiVal, { color: result.aqi <= 50 ? '#2dd4bf' : '#fbbf24' }]}>{result.aqi}</Text>
                  <Text style={styles.aqiLabel}>Air Quality Index</Text>
                  <View style={styles.divider} />
                  <View style={styles.miniGrid}>
                    <MetricItem icon="water" color="#38bdf8" label="Humidity" val={result.iaqi?.h?.v} unit="%" />
                    <MetricItem icon="thermometer" color="#fb923c" label="Temp" val={result.iaqi?.t?.v} unit="°C" />
                    <MetricItem icon="navigate" color="#2dd4bf" label="Wind" val={result.iaqi?.w?.v} unit="m/s" />
                  </View>
                </Animated.View>

                {/* Remove Button Below Card */}
                <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  <Text style={styles.removeText}>Clear Result</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ExpoGradient>
  );
}

const MetricItem = ({ icon, color, label, val, unit }: any) => (
  <View style={styles.miniItem}>
    <Ionicons name={icon} size={18} color={color} />
    <Text style={styles.miniVal}>{typeof val === 'number' ? val.toFixed(1) : '--'}{unit}</Text>
    <Text style={styles.miniLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 120 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 20, marginBottom: 25 },
  searchWrapper: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 6, alignItems: 'center' },
  input: { flex: 1, color: '#fff', paddingHorizontal: 15, height: 50, fontSize: 16 },
  searchButton: { paddingHorizontal: 22, height: 44, borderRadius: 14, justifyContent: 'center' },
  buttonText: { color: '#0f172a', fontWeight: '800' },
  resultCard: { marginTop: 30, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 30, padding: 30, alignItems: 'center' },
  cityName: { color: '#94a3b8', fontSize: 16, fontWeight: '600', marginBottom: 20 },
  aqiVal: { fontSize: 80, fontWeight: '900' },
  aqiLabel: { color: '#64748b', fontWeight: '800', textTransform: 'uppercase', fontSize: 11 },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 25 },
  miniGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  miniItem: { alignItems: 'center', flex: 1 },
  miniLabel: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  miniVal: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 5 },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  removeText: { color: '#ef4444', fontWeight: '700', marginLeft: 8, fontSize: 14 }
});