import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Switch, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Alert, Platform, Linking, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

// --- Storage Keys ---
const KEYS = {
  NOTIFS: '@skypure_notifs',
  UNIT: '@skypure_unit',
  PRECISION: '@skypure_precision',
  SYNC: '@skypure_sync',
  USER_NAME: '@skypure_user_name',
  USER_PHONE: '@skypure_user_phone'
};

export default function Settings() {
  const router = useRouter();
  
  // Profile States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const email = auth.currentUser?.email || 'N/A';

  // Toggle States
  const [notifications, setNotifications] = useState(true);
  const [useImperial, setUseImperial] = useState(false);
  const [highPrecision, setHighPrecision] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  // 1. Load Saved Preferences & Profile on Mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const values = await AsyncStorage.multiGet([
          KEYS.NOTIFS, KEYS.UNIT, KEYS.PRECISION, KEYS.SYNC,
          KEYS.USER_NAME, KEYS.USER_PHONE
        ]);
        
        values.forEach(([key, value]) => {
          if (value !== null) {
            if (key === KEYS.USER_NAME) setName(value);
            if (key === KEYS.USER_PHONE) setPhone(value);
            
            // Handle Booleans
            const boolValue = value === 'true';
            if (key === KEYS.NOTIFS) setNotifications(boolValue);
            if (key === KEYS.UNIT) setUseImperial(boolValue);
            if (key === KEYS.PRECISION) setHighPrecision(boolValue);
            if (key === KEYS.SYNC) setAutoSync(boolValue);
          }
        });
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    };
    loadData();
  }, []);

  // 2. Persistent Toggle Logic
  const toggleSetting = async (key: string, value: boolean, setter: Function) => {
    try {
      setter(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      Alert.alert("Error", "Could not save preference.");
    }
  };

  // 3. Save Profile Logic
  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem(KEYS.USER_NAME, name);
      await AsyncStorage.setItem(KEYS.USER_PHONE, phone);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e) {
      Alert.alert("Error", "Could not save profile info.");
    }
  };

  // 4. Logout Logic
  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/login');
          } catch (e) {
            Alert.alert("Error", "Logout failed.");
          }
        } 
      }
    ]);
  };

  const openSystemSettings = () => {
    Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings();
  };

  const confirmReset = () => {
    Alert.alert("Clear All Data", "This will reset all preferences. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Reset", 
        style: "destructive", 
        onPress: async () => {
          await AsyncStorage.clear();
          setName('');
          setPhone('');
          setNotifications(true);
          setUseImperial(false);
          setHighPrecision(true);
          setAutoSync(true);
          Alert.alert("Success", "App data has been cleared.");
        } 
      }
    ]);
  };

  return (
    <LinearGradient colors={['#0f172a', '#134e4a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your profile & tools</Text>
          </View>

          {/* PROFILE SECTION */}
          <Text style={styles.sectionLabel}>My Profile</Text>
          <View style={styles.glassCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput 
                style={styles.textInput} 
                value={name} 
                onChangeText={setName} 
                placeholder="Enter your name" 
                placeholderTextColor="#64748b"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <Text style={styles.staticEmail}>{email}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput 
                style={styles.textInput} 
                value={phone} 
                onChangeText={setPhone} 
                placeholder="Enter phone number" 
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
              <LinearGradient colors={['#2dd4bf', '#0d9488']} style={styles.saveBtnGradient}>
                <Text style={styles.saveBtnText}>Save Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ALERTS SECTION */}
          <Text style={styles.sectionLabel}>Alerts & Notifications</Text>
          <View style={styles.glassCard}>
            <SettingRow 
              icon="notifications" color="#fbbf24" label="AQI Alerts" 
              sub="Notify if air becomes hazardous" 
              value={notifications} 
              onValueChange={(v: boolean) => toggleSetting(KEYS.NOTIFS, v, setNotifications)} 
            />
            <View style={styles.divider} />
            <SettingRow 
              icon="refresh" color="#2dd4bf" label="Real-time Sync" 
              sub="Update data in background" 
              value={autoSync} 
              onValueChange={(v: boolean) => toggleSetting(KEYS.SYNC, v, setAutoSync)} 
            />
          </View>

          {/* PREFERENCES SECTION */}
          <Text style={styles.sectionLabel}>Units & Display</Text>
          <View style={styles.glassCard}>
            <SettingRow 
              icon="thermometer" color="#fb923c" label="Temperature Unit" 
              sub={useImperial ? "Fahrenheit (°F)" : "Celsius (°C)"} 
              value={useImperial} 
              onValueChange={(v: boolean) => toggleSetting(KEYS.UNIT, v, setUseImperial)} 
            />
            <View style={styles.divider} />
            <SettingRow 
              icon="location" color="#38bdf8" label="High Precision GPS" 
              sub="Uses more battery for accuracy" 
              value={highPrecision} 
              onValueChange={(v: boolean) => toggleSetting(KEYS.PRECISION, v, setHighPrecision)} 
            />
          </View>

          {/* SYSTEM & SECURITY SECTION */}
          <Text style={styles.sectionLabel}>System & Security</Text>
          <View style={styles.glassCard}>
            <ActionRow 
              icon="lock-closed" color="#a78bfa" label="App Permissions" 
              onPress={openSystemSettings} 
            />
            <View style={styles.divider} />
            <ActionRow 
              icon="trash-outline" color="#f87171" label="Reset App Cache" 
              onPress={confirmReset} 
            />
            <View style={styles.divider} />
            <ActionRow 
              icon="log-out" color="#f87171" label="Sign Out" 
              onPress={handleLogout} 
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>SkyPure v1.0.5</Text>
            <Text style={styles.copyright}>Breathe Better • Live Longer</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- Internal Helper Components ---
const SettingRow = ({ icon, color, label, sub, value, onValueChange }: any) => (
  <View style={styles.row}>
    <View style={styles.rowLead}>
      <View style={[styles.iconBg, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSubLabel}>{sub}</Text>
      </View>
    </View>
    <Switch 
      value={value} 
      onValueChange={onValueChange}
      trackColor={{ false: '#334155', true: '#2dd4bf' }}
      thumbColor="#fff"
    />
  </View>
);

const ActionRow = ({ icon, color, label, onPress }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLead}>
      <View style={[styles.iconBg, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.rowLabel, { marginLeft: 15 }]}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#475569" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 140 },
  header: { marginTop: 20, marginBottom: 30 },
  headerTitle: { fontSize: 34, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  headerSubtitle: { fontSize: 15, color: '#94a3b8', marginTop: 4 },
  sectionLabel: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 5 },
  glassCard: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 28, padding: 10, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  rowLead: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rowText: { marginLeft: 15 },
  rowLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rowSubLabel: { color: '#64748b', fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginHorizontal: 15 },
  inputGroup: { padding: 15 },
  inputLabel: { color: '#2dd4bf', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 },
  textInput: { color: '#fff', fontSize: 16, fontWeight: '600', paddingVertical: 5 },
  staticEmail: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
  saveBtn: { marginTop: 10, marginHorizontal: 15, marginBottom: 15, borderRadius: 15, overflow: 'hidden' },
  saveBtnGradient: { paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { color: '#0f172a', fontWeight: '800', fontSize: 14, textTransform: 'uppercase' },
  footer: { marginTop: 10, alignItems: 'center' },
  versionText: { color: '#475569', fontSize: 12, fontWeight: '800' },
  copyright: { color: '#334155', fontSize: 10, marginTop: 5, fontWeight: '600', letterSpacing: 1 }
});