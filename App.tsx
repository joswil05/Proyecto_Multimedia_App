import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DataProvider } from './src/context/DataContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { PipelineScreen } from './src/screens/PipelineScreen';
import { EventsScreen } from './src/screens/EventsScreen';
import { IdeaDetailModal } from './src/components/IdeaDetailModal';
import { useData } from './src/context/DataContext';
import { colors, spacing, fontSize, borderRadius } from './src/constants/theme';

type TabType = 'home' | 'pipeline' | 'calendar' | 'events';

const MainTabs = () => {
  const { globalSelectedIdeaId, setGlobalSelectedIdeaId } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'pipeline' && <PipelineScreen />}
        {activeTab === 'calendar' && <CalendarScreen />}
        {activeTab === 'events' && <EventsScreen />}
      </View>
      
      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('home')}>
          <Ionicons
            name={activeTab === 'home' ? 'grid' : 'grid-outline'}
            size={24}
            color={activeTab === 'home' ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'home' ? colors.accent : colors.textMuted }]}>
            Tablero
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('pipeline')}>
          <Ionicons
            name={activeTab === 'pipeline' ? 'layers' : 'layers-outline'}
            size={24}
            color={activeTab === 'pipeline' ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'pipeline' ? colors.accent : colors.textMuted }]}>
            Producción
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('calendar')}>
          <Ionicons
            name={activeTab === 'calendar' ? 'calendar' : 'calendar-outline'}
            size={24}
            color={activeTab === 'calendar' ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'calendar' ? colors.accent : colors.textMuted }]}>
            Calendario
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('events')}>
          <Ionicons
            name={activeTab === 'events' ? 'flag' : 'flag-outline'}
            size={24}
            color={activeTab === 'events' ? colors.accent : colors.textMuted}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'events' ? colors.accent : colors.textMuted }]}>
            Eventos
          </Text>
        </TouchableOpacity>

      </View>

      {/* Global Idea Detail Modal for Notifications */}
      {globalSelectedIdeaId !== null && (
        <IdeaDetailModal
          visible={globalSelectedIdeaId !== null}
          onClose={() => setGlobalSelectedIdeaId(null)}
          ideaId={globalSelectedIdeaId}
        />
      )}
    </View>
  );
};

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textSecondary }}>Cargando...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <DataProvider>
      <MainTabs />
    </DataProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
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

