import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile // Added to save the user's name
} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const [name, setName] = useState(''); // New state for Name
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    const cleanEmail = email.trim(); 
    
    if (!isLogin && !name.trim()) {
      Alert.alert("Missing Info", "Please enter your name.");
      return;
    }

    if (!cleanEmail || !password) {
      Alert.alert("Missing Info", "Please enter both email and password.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        
        // Update the user's profile with the provided name
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: name.trim()
          });
        }
        
        Alert.alert("Success", `Welcome to SkyPure, ${name}!`);
      }
    } catch (error: any) {
      let errorMessage = "Authentication failed.";
      switch (error.code) {
        case 'auth/invalid-email': errorMessage = "Invalid email format."; break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': errorMessage = "Invalid email or password."; break;
        case 'auth/email-already-in-use': errorMessage = "This email is already registered."; break;
        default: errorMessage = error.message;
      }
      Alert.alert("Auth Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#134e4a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.bgCircle} />

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.replace('/')}
      >
        <Ionicons name="chevron-back" size={28} color="#2dd4bf" />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.content}
      >
        <Animated.View entering={FadeInUp.delay(200)} style={styles.headerContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="leaf" size={40} color="#2dd4bf" />
          </View>
          <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Join SkyPure'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Log in to access your air quality data.' : 'Sign up to start monitoring air quality.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.glassCard}>
          
          {/* NAME FIELD - Only shows on Sign Up */}
          {!isLogin && (
            <Animated.View entering={FadeInDown} style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </Animated.View>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#64748b"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#64748b"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <Animated.View entering={FadeInDown} style={styles.inputWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#64748b"
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </Animated.View>
          )}

          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleAuth} 
            style={styles.buttonWrapper}
            disabled={loading}
          >
            <LinearGradient colors={['#2dd4bf', '#0d9488']} style={styles.mainButton}>
              {loading ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.buttonText}>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity 
          onPress={() => {
            setIsLogin(!isLogin);
            setName(''); // Reset name on toggle
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }} 
          style={styles.toggleContainer}
        >
          <Text style={styles.toggleLabel}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.toggleAction}>{isLogin ? "Sign Up" : "Log In"}</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(45, 212, 191, 0.05)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 55, color: '#fff', fontSize: 16 },
  buttonWrapper: { borderRadius: 16, overflow: 'hidden', marginTop: 10, elevation: 8 },
  mainButton: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#0f172a', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  toggleContainer: { marginTop: 30 },
  toggleLabel: { color: '#94a3b8', fontSize: 15 },
  toggleAction: { color: '#2dd4bf', fontWeight: 'bold' },
});