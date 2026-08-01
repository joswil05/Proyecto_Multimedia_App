import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { EventsCarousel } from '../components/EventsCarousel';
import { IdeaCard } from '../components/IdeaCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { QuickCaptureModal } from '../components/QuickCaptureModal';
import { EventManagerModal } from '../components/EventManagerModal';
import { EventDetailModal } from '../components/EventDetailModal';
import { IdeaDetailModal } from '../components/IdeaDetailModal';
import { useData } from '../context/DataContext';
import { PinnedEvent } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

export const HomeScreen: React.FC = () => {
  const {
    events,
    ideas,
    pinnedEventId,
    addEvent,
    deleteEvent,
    pinEvent,
    addIdea,
  } = useData();

  // Modal states
  const [captureModalVisible, setCaptureModalVisible] = useState(false);
  const [eventManagerVisible, setEventManagerVisible] = useState(false);
  const [eventDetailVisible, setEventDetailVisible] = useState(false);
  const [ideaDetailVisible, setIdeaDetailVisible] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<PinnedEvent | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleEventPress = (event: PinnedEvent) => {
    setSelectedEvent(event);
    setEventDetailVisible(true);
  };

  const handleIdeaPress = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setIdeaDetailVisible(true);
  };

  // ── List Components ────────────────────────────────────────────────
  const renderHeader = useCallback(
    () => (
      <>
        <View style={styles.appHeader}>
          <View>
            <Text style={styles.appTitle}>Content OS</Text>
            <View style={styles.orgRow}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.orgName}>Equipo de Medios</Text>
            </View>
          </View>
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.textSecondary}
            onPress={() => setEventManagerVisible(true)}
          />
        </View>

        <EventsCarousel
          events={events}
          onEventPress={handleEventPress}
          onCreateEvent={() => setEventManagerVisible(true)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ideas Recientes</Text>
          <View style={styles.ideaCountBadge}>
            <Text style={styles.ideaCount}>{ideas.length}</Text>
          </View>
        </View>
      </>
    ),
    [events, ideas.length]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Ionicons name="bulb-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Sin ideas aún</Text>
        <Text style={styles.emptySubtitle}>
          Toca el botón + para capturar tu primera idea
        </Text>
      </View>
    ),
    []
  );

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            event={events.find((e) => e.id === item.eventId)}
            onPress={() => handleIdeaPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton onPress={() => setCaptureModalVisible(true)} />

      <QuickCaptureModal
        visible={captureModalVisible}
        onClose={() => setCaptureModalVisible(false)}
        onSave={(idea) => {
          addIdea(idea);
          setCaptureModalVisible(false);
        }}
        events={events}
        pinnedEventId={pinnedEventId}
      />

      <EventManagerModal
        visible={eventManagerVisible}
        onClose={() => setEventManagerVisible(false)}
        events={events}
        pinnedEventId={pinnedEventId}
        onCreateEvent={(e) => {
          addEvent(e);
          setEventManagerVisible(false);
        }}
        onPinEvent={pinEvent}
        onDeleteEvent={deleteEvent}
      />

      <EventDetailModal
        visible={eventDetailVisible}
        onClose={() => setEventDetailVisible(false)}
        event={selectedEvent}
      />

      <IdeaDetailModal
        visible={ideaDetailVisible}
        onClose={() => setIdeaDetailVisible(false)}
        ideaId={selectedIdeaId}
      />
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  appTitle: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  orgName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ideaCountBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  ideaCount: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.xxxl,
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
