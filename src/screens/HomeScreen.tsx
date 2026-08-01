import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PinnedEventBanner } from '../components/PinnedEventBanner';
import { IdeaCard } from '../components/IdeaCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { QuickCaptureModal } from '../components/QuickCaptureModal';
import { EventManagerModal } from '../components/EventManagerModal';
import { Idea, PinnedEvent } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

// ── Component ──────────────────────────────────────────────────────────
export const HomeScreen: React.FC = () => {
  // Events state
  const [events, setEvents] = useState<PinnedEvent[]>([]);
  const [pinnedEventId, setPinnedEventId] = useState<string | null>(null);

  // Ideas state
  const [ideas, setIdeas] = useState<Idea[]>([]);

  // Modal states
  const [captureModalVisible, setCaptureModalVisible] = useState(false);
  const [eventManagerVisible, setEventManagerVisible] = useState(false);

  // Derived
  const pinnedEvent = events.find((e) => e.id === pinnedEventId) || null;

  // ── Event Handlers ─────────────────────────────────────────────────
  const handleCreateEvent = useCallback(
    (newEvent: Omit<PinnedEvent, 'id' | 'completedContent'>) => {
      const event: PinnedEvent = {
        ...newEvent,
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        completedContent: 0,
      };
      setEvents((prev) => [...prev, event]);
      setPinnedEventId(event.id);
      setEventManagerVisible(false);
    },
    []
  );

  const handlePinEvent = useCallback((eventId: string | null) => {
    setPinnedEventId(eventId);
  }, []);

  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      if (pinnedEventId === eventId) {
        setPinnedEventId(null);
      }
      // Unlink ideas from deleted event
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.eventId === eventId ? { ...idea, eventId: undefined } : idea
        )
      );
    },
    [pinnedEventId]
  );

  // ── Idea Handlers ──────────────────────────────────────────────────
  const handleSaveIdea = useCallback(
    (newIdea: Omit<Idea, 'id' | 'createdAt' | 'status'>) => {
      const idea: Idea = {
        ...newIdea,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        status: 'idea',
        createdAt: new Date(),
      };
      setIdeas((prev) => [idea, ...prev]);
      setCaptureModalVisible(false);
    },
    []
  );

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
        </View>

        <PinnedEventBanner
          event={pinnedEvent}
          onManageEvents={() => setEventManagerVisible(true)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ideas Recientes</Text>
          <View style={styles.ideaCountBadge}>
            <Text style={styles.ideaCount}>{ideas.length}</Text>
          </View>
        </View>
      </>
    ),
    [pinnedEvent, ideas.length]
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IdeaCard
            idea={item}
            event={events.find((e) => e.id === item.eventId)}
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
        onSave={handleSaveIdea}
        events={events}
        pinnedEventId={pinnedEventId}
      />

      <EventManagerModal
        visible={eventManagerVisible}
        onClose={() => setEventManagerVisible(false)}
        events={events}
        pinnedEventId={pinnedEventId}
        onCreateEvent={handleCreateEvent}
        onPinEvent={handlePinEvent}
        onDeleteEvent={handleDeleteEvent}
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
    paddingTop: spacing.xxl,
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
