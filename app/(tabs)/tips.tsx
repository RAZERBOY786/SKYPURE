import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface HealthTip {
  id: number;
  text: string;
  icon: string;
  category: string;
  detail: string;
  image: string;
}

const HEALTH_TIPS: HealthTip[] = [
  { 
    id: 1, 
    text: "Wear an N95 mask in highly polluted areas.", 
    icon: "😷", 
    category: "Protection",
    detail: "Standard surgical masks don't filter out PM2.5 particles. N95 or FFP2 masks provide a tight seal and filter 95% of airborne particles. Ensure the nose clip is pinched for a full seal.",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800"
  },
  { 
    id: 2, 
    text: "Avoid outdoor exercise when AQI exceeds 100.", 
    icon: "🏃‍♂️", 
    category: "Activity",
    detail: "Heavy breathing during exercise draws pollutants deeper into the lungs. On high AQI days, switch to indoor yoga or gym workouts with filtered air.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800"
  },
  { 
    id: 3, 
    text: "Run air purifiers to filter indoor PM2.5.", 
    icon: "🏠", 
    category: "Indoor",
    detail: "HEPA filters are essential for removing microscopic dust. Keep purifiers away from walls and running 24/7 on low speed during high pollution weeks.",
    image: "https://images.unsplash.com/photo-1626330333405-09039988295b?q=80&w=800"
  },
  { 
    id: 4, 
    text: "Hydrate often to help flush out toxins.", 
    icon: "💧", 
    category: "Health",
    detail: "Drinking water keeps your mucous membranes moist, which helps trap pollutants before they reach your lungs. Aim for 2-3 liters on high-haze days.",
    image: "https://images.unsplash.com/photo-1548919973-5cfe5d4fc490?q=80&w=800"
  },
  { 
    id: 5, 
    text: "Eat antioxidant-rich foods like broccoli.", 
    icon: "🥦", 
    category: "Nutrition",
    detail: "Antioxidants like Vitamin C and E help your body fight the oxidative stress caused by breathing in smog. Focus on leafy greens, citrus, and nuts.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800"
  },
  { 
    id: 6, 
    text: "Keep indoor plants to improve air quality.", 
    icon: "🪴", 
    category: "Indoor",
    detail: "Plants like Snake Plants and Aloe Vera can naturally filter out common household toxins like formaldehyde and benzene.",
    image: "https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=800"
  },
  { 
    id: 7, 
    text: "Check AQI levels before heading out.", 
    icon: "📱", 
    category: "Awareness",
    detail: "Pollution levels often peak in the early morning and late evening. Use local air quality apps to plan your commutes during 'Green' hours.",
    image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=800"
  },
  { 
    id: 8, 
    text: "Steam inhalation to clear airways.", 
    icon: "🧖‍♂️", 
    category: "Recovery",
    detail: "If you've been exposed to heavy smog, 10 minutes of steam inhalation can help soothe irritated nasal passages and loosen trapped particulates.",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800"
  },
  { 
    id: 9, 
    text: "Switch to eco-friendly cleaning products.", 
    icon: "🧼", 
    category: "Indoor",
    detail: "Harsh chemicals contribute to VOCs (Volatile Organic Compounds) inside your home. Using natural cleaners reduces the chemical load on your lungs.",
    image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800"
  },
  { 
    id: 10, 
    text: "Get regular health check-ups for lungs.", 
    icon: "🏥", 
    category: "Health",
    detail: "Long-term exposure to pollution can be subtle. If you experience a persistent cough, consult a specialist for a spirometry test.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dad99901?q=80&w=800"
  }
];

export default function Tips() {
  const [selectedTip, setSelectedTip] = useState<HealthTip | null>(null);
  const animatedValues = useRef(HEALTH_TIPS.map(() => new Animated.Value(0))).current;
  const fadeTitle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeTitle, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const animations = HEALTH_TIPS.map((_, i) => {
      return Animated.spring(animatedValues[i], {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
        delay: i * 100, // Faster stagger for 10 items
      });
    });
    Animated.parallel(animations).start();
  }, []);

  return (
    <LinearGradient colors={['#0f172a', '#134e4a']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View style={[styles.header, { opacity: fadeTitle }]}>
            <Text style={styles.headerTitle}>Health Guide</Text>
            <Text style={styles.headerSubtitle}>Expert tips for your well-being</Text>
          </Animated.View>

          {HEALTH_TIPS.map((item, index) => (
            <TouchableOpacity 
              activeOpacity={0.8} 
              key={item.id} 
              onPress={() => setSelectedTip(item)}
            >
              <Animated.View
                style={[
                  styles.tipCard,
                  {
                    opacity: animatedValues[index],
                    transform: [
                      { translateY: animatedValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0]
                        }) 
                      }
                    ]
                  }
                ]}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>
                
                <View style={styles.content}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                  <Text style={styles.tipText}>{item.text}</Text>
                  <Text style={styles.readMore}>View Details →</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}
          <View style={styles.footerSpacer} />
        </ScrollView>
      </SafeAreaView>

      {/* --- DETAIL MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedTip}
        onRequestClose={() => setSelectedTip(null)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          
          <View style={styles.modalContent}>
            {selectedTip && (
              <>
                <Image source={{ uri: selectedTip.image }} style={styles.modalImage} />
                <ScrollView style={styles.modalPadding}>
                  <Text style={styles.modalCategory}>{selectedTip.category}</Text>
                  <Text style={styles.modalTitle}>{selectedTip.text}</Text>
                  <Text style={styles.modalDescription}>{selectedTip.detail}</Text>
                  
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setSelectedTip(null)}
                  >
                    <Text style={styles.closeButtonText}>Got it!</Text>
                  </TouchableOpacity>
                  <View style={{ height: 40 }} />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginTop: 30, marginBottom: 25 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#2dd4bf', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  iconText: { fontSize: 24 },
  content: { flex: 1 },
  categoryText: { color: '#2dd4bf', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  tipText: { color: '#fff', fontSize: 15, fontWeight: '500', lineHeight: 22 },
  readMore: { color: '#2dd4bf', fontSize: 12, marginTop: 8, fontWeight: '700' },
  footerSpacer: { height: 40 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 0.85,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalImage: {
    width: '100%',
    height: height * 0.3,
    resizeMode: 'cover',
  },
  modalPadding: {
    padding: 24,
  },
  modalCategory: {
    color: '#2dd4bf',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 15,
    lineHeight: 32,
  },
  modalDescription: {
    color: '#94a3b8',
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 30,
  },
  closeButton: {
    backgroundColor: '#2dd4bf',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButtonText: {
    color: '#0f172a',
    fontWeight: '900',
    fontSize: 16,
  }
});