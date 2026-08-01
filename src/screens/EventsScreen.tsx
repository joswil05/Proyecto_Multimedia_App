import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useData } from '../context/DataContext';
import { EventManagerModal } from '../components/EventManagerModal';
import { EventDetailModal } from '../components/EventDetailModal';
import { PinnedEvent } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

export const EventsScreen: React.FC = () => {
  const { events, pinnedEventId, addEvent, deleteEvent, pinEvent } = useData();
  
  const [managerVisible, setManagerVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PinnedEvent | null>(null);

  const handleEventPress = (event: PinnedEvent) => {
    setSelectedEvent(event);
    setDetailVisible(true);
  };

  const renderEventCard = ({ item }: { item: PinnedEvent }) => {
    const isPinned = item.id === pinnedEventId;
    const progress = (item.completedContent / item.totalContentGoal) * 100;
    
    return (
      <TouchableOpacity
        style={styles.eventCard}
        activeOpacity={0.8}
        onPress={() => handleEventPress(item)}
      >
        <LinearGradient
          colors={item.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon as any} size={24} color="#FFF" />
            </View>
            {isPinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={12} color={colors.accent} />
                <Text style={styles.pinnedText}>Fijado</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.eventTitle}>{item.title}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {item.completedContent} / {item.totalContentGoal} piezas
              </Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Campañas</Text>
          <Text style={styles.headerSubtitle}>Gestión de eventos especiales</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setManagerVisible(true)}>
          <Ionicons name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin campañas activas</Text>
            <Text style={styles.emptySubtitle}>
              Crea tu primer evento especial o campaña publicitaria.
            </Text>
          </View>
        )}
      />

      <EventManagerModal
        visible={managerVisible}
        onClose={() => setManagerVisible(false)}
        events={events}
        pinnedEventId={pinnedEventId}
        onCreateEvent={(e) => {
          addEvent(e);
          setManagerVisible(false);
        }}
        onPinEvent={pinEvent}
        onDeleteEvent={deleteEvent}
      />

      <EventDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        event={selectedEvent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.textPrimary,
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.xl,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  eventCard: {
    height: 180,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  pinnedText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  eventTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#FFF',
    marginTop: spacing.md,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  progressPercent: {
    color: '#FFF',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
