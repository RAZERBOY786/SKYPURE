import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();

  // Animation Shared Values
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const orb1Y = useSharedValue(0);
  const orb2Y = useSharedValue(0);
  const btnPulse = useSharedValue(1);

  useEffect(() => {
    // Entrance Animations
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 1000 });

    // Slow Background Orb Movements
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(-40, { duration: 4000 }),
        withTiming(40, { duration: 4000 })
      ),
      -1,
      true
    );

    orb2Y.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 5000 }),
        withTiming(-50, { duration: 5000 })
      ),
      -1,
      true
    );

    // Continuous Button Pulse
    btnPulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  // Fixed Animated Styles
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => {
    // Fix: Interpolate must be inside useAnimatedStyle
    const translateY = interpolate(opacity.value, [0, 1], [40, 0]);
    return {
      opacity: opacity.value,
      transform: [{ translateY }],
    };
  });

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb1Y.value }, { scale: 1.2 }],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb2Y.value }, { scale: 1.1 }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnPulse.value }],
    opacity: opacity.value,
  }));

  return (
    <LinearGradient colors={['#020617', '#0f172a', '#134e4a']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- BACKGROUND ORBS --- */}
      <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
      
      <View style={styles.content}>
        {/* LOGO */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.iconGlow}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1779/1779940.png' }}
              style={styles.logo}
            />
          </View>
        </Animated.View>

        {/* TEXT */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>SkyPure</Text>
          <View style={styles.taglineWrapper}>
            <View style={styles.line} />
            <Text style={styles.tagline}>NEURAL AIR MONITORING</Text>
            <View style={styles.line} />
          </View>
        </Animated.View>

        {/* ACTION */}
        <Animated.View style={[styles.footerContainer, buttonStyle]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace('/home')} // Change to your actual route
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={['#2dd4bf', '#0d9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Ionicons name="chevron-forward" size={20} color="#020617" />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>Stay Informed • Breathe Better</Text>
          <Text style={styles.versionText}>V 1.0.5 • POWERED BY AI</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

// Ensure you have Ionicons imported or remove the icon line
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  orb: { position: 'absolute', borderRadius: 1000, opacity: 0.2 },
  orb1: { width: width, height: width, backgroundColor: '#2dd4bf', top: -100, right: -150 },
  orb2: { width: width * 0.8, height: width * 0.8, backgroundColor: '#134e4a', bottom: -50, left: -100 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 25, zIndex: 5 },
  logoContainer: { marginBottom: 30 },
  iconGlow: {
    padding: 30,
    borderRadius: 100,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  logo: { width: 100, height: 100, tintColor: '#fff' },
  textContainer: { alignItems: 'center', marginBottom: 60 },
  title: { fontSize: 56, fontWeight: '900', color: '#fff', letterSpacing: -2 },
  taglineWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  tagline: { fontSize: 10, color: '#2dd4bf', fontWeight: '800', letterSpacing: 3, marginHorizontal: 10 },
  line: { height: 1, width: 20, backgroundColor: 'rgba(45, 212, 191, 0.3)' },
  footerContainer: { alignItems: 'center', width: '100%' },
  buttonWrapper: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  button: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  buttonText: { color: '#020617', fontSize: 18, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  footerText: { color: '#64748b', fontSize: 13, marginTop: 30, fontWeight: '600' },
  versionText: { color: '#334155', fontSize: 9, marginTop: 15, fontWeight: '800', letterSpacing: 4 }
});