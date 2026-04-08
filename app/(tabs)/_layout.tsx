import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur'; 

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2dd4bf', 
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 10,
        },
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          backgroundColor: 'transparent', 
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <GlassIcon name={focused ? "home" : "home-outline"} color={color} focused={focused} />
          ),
        }}
      />

      {/* ✅ Fixed: Map Screen is now properly inside the <Tabs> component */}
      <Tabs.Screen
        name="map"
        options={{
          title: 'Air Map',
          tabBarIcon: ({ color, focused }) => (
            <GlassIcon name={focused ? "map" : "map-outline"} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <GlassIcon name={focused ? "search" : "search-outline"} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="tips"
        options={{
          title: 'Guide',
          tabBarIcon: ({ color, focused }) => (
            <GlassIcon name={focused ? "leaf" : "leaf-outline"} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <GlassIcon name={focused ? "settings" : "settings-outline"} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

// 🔹 Custom Icon with a "Glow" indicator
function GlassIcon({ name, color, focused }: { name: any, color: string, focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Ionicons name={name} size={24} color={color} />
      {focused && (
        <View style={styles.glowDot} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  glowDot: {
    position: 'absolute',
    bottom: -12,
    width: 20,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#2dd4bf',
    shadowColor: '#2dd4bf',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});