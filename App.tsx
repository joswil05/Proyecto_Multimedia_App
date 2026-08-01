import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from './src/screens/HomeScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { DataProvider } from './src/context/DataContext';
import { colors, spacing, fontSize } from './src/constants/theme';

function MainTabs() {
  const [activeTab, setActiveTab] = useState<'home' | 'calendar'>('home');
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      {activeTab === 'home' ? <HomeScreen /> : <CalendarScreen />}
      
      <View style={[styles.tabBar, { paddingBottom: insets.bottom || spacing.md }]}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('home')}
        >
          <Ionicons
            name={activeTab === 'home' ? 'grid' : 'grid-outline'}
            size={24}
            color={activeTab === 'home' ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'home' ? colors.accent : colors.textMuted }]}>
            Tablero
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab('calendar')}
        >
          <Ionicons
            name={activeTab === 'calendar' ? 'calendar' : 'calendar-outline'}
            size={24}
            color={activeTab === 'calendar' ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'calendar' ? colors.accent : colors.textMuted }]}>
            Calendario
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <MainTabs />
      </DataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});

