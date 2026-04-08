import { create } from 'zustand';

const API_TOKEN = 'b0d535a0af926f66433def6d5c1d21877312f7e6';

interface AQIData {
  city: string;
  aqi: number;
  status: string;
  temp: number;
  wind: number;
  humidity: number;
  advice: string[];
}

interface AQIState {
  currentData: AQIData | null;
  unit: 'C' | 'F';
  darkMode: boolean;
  notifications: boolean;
  recentSearches: string[];

  fetchAQI: (city: string) => Promise<void>;
  addRecentSearch: (city: string) => void;
  clearRecentSearches: () => void;
  toggleUnit: () => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
}

export const useAQIStore = create<AQIState>((set) => ({
  currentData: null,
  unit: 'C',
  darkMode: false,
  notifications: true,
  recentSearches: ['New Delhi', 'Mumbai', 'Kolkata'],

  // 🌍 FETCH AQI
  fetchAQI: async (city: string) => {
    try {
      const response = await fetch(
        `https://api.waqi.info/feed/${city}/?token=${API_TOKEN}`
      );
      const json = await response.json();

      if (json.status === 'ok') {
        const data = json.data;
        const aqiValue = data.aqi;

        let status = '';
        let advice: string[] = [];

        // ✅ FIXED AQI LOGIC (correct order)
        if (aqiValue <= 50) {
          status = 'Good';
          advice = ['Air quality is satisfactory.'];
        } else if (aqiValue <= 100) {
          status = 'Moderate';
          advice = ['Sensitive groups should reduce outdoor activity.'];
        } else if (aqiValue <= 200) {
          status = 'Unhealthy';
          advice = ['Wear a mask outside.', 'Avoid prolonged exposure.'];
        } else if (aqiValue <= 300) {
          status = 'Very Unhealthy';
          advice = ['Avoid outdoor activities.', 'Keep windows closed.'];
        } else {
          status = 'Hazardous';
          advice = ['Stay indoors.', 'Use air purifier if possible.'];
        }

        set({
          currentData: {
            city: data.city?.name || city,
            aqi: aqiValue,
            status,
            temp: data.iaqi?.t?.v || 0,
            wind: data.iaqi?.w?.v || 0,
            humidity: data.iaqi?.h?.v || 0,
            advice,
          },
        });
      } else {
        // ❌ API error fallback
        set({
          currentData: {
            city,
            aqi: 0,
            status: 'Unavailable',
            temp: 0,
            wind: 0,
            humidity: 0,
            advice: ['Unable to fetch data. Try again later.'],
          },
        });
      }
    } catch (error) {
      console.error('Network Error:', error);

      // ❌ Network error fallback
      set({
        currentData: {
          city,
          aqi: 0,
          status: 'Network Error',
          temp: 0,
          wind: 0,
          humidity: 0,
          advice: ['Check your internet connection.'],
        },
      });
    }
  },

  // 🔍 Recent searches
  addRecentSearch: (city) =>
    set((state) => ({
      recentSearches: [
        city,
        ...state.recentSearches.filter((c) => c !== city),
      ].slice(0, 5),
    })),

  clearRecentSearches: () => set({ recentSearches: [] }),

  // ⚙️ Settings
  toggleUnit: () =>
    set((state) => ({
      unit: state.unit === 'C' ? 'F' : 'C',
    })),

  toggleDarkMode: () =>
    set((state) => ({
      darkMode: !state.darkMode,
    })),

  toggleNotifications: () =>
    set((state) => ({
      notifications: !state.notifications,
    })),
}));