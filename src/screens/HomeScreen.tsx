import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PinnedEventBanner } from '../components/PinnedEventBanner';
import { IdeaCard } from '../components/IdeaCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { QuickCaptureModal } from '../components/QuickCaptureModal';
import { Idea, PinnedEvent } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

// ── Mock Data ──────────────────────────────────────────────────────────
const MOCK_EVENT: PinnedEvent = {
  id: 'evt-1',
  title: 'Campamento de Jóvenes 2026',
  emoji: '🎪',
  targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  totalContentGoal: 10,
  completedContent: 3,
};

const INITIAL_IDEAS: Idea[] = [
  {
    id: '1',
    text: 'Reel mostrando el countdown al campamento con música épica y transiciones rápidas',
    channels: ['instagram', 'tiktok'],
    status: 'idea',
    eventId: 'evt-1',
    useAI: true,
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: '2',
    text: 'Video testimonio de jóvenes del campamento pasado compartiendo su experiencia y cómo les cambió la vida',
    channels: ['youtube', 'facebook'],
    status: 'idea',
    useAI: false,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: '3',
    text: 'Carrusel con tips para prepararse al campamento: qué llevar, horarios y actividades',
    channels: ['instagram', 'facebook', 'whatsapp'],
    status: 'idea',
    eventId: 'evt-1',
    useAI: true,
    createdAt: new Date(Date.now() - 86400000),
  },
];

// ── Component ──────────────────────────────────────────────────────────
export const HomeScreen: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSaveIdea = useCallback(
    (newIdea: Omit<Idea, 'id' | 'createdAt' | 'status'>) => {
      const idea: Idea = {
        ...newIdea,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        status: 'idea',
        createdAt: new Date(),
      };
      setIdeas((prev) => [idea, ...prev]);
      setModalVisible(false);
    },
    []
  );

  const renderHeader = useCallback(
    () => (
      <>
        {/* App Header */}
        <View style={styles.appHeader}>
          <View>
            <Text style={styles.appTitle}>Content OS</Text>
            <Text style={styles.orgName}>📡 Equipo de Medios</Text>
          </View>
        </View>

        {/* Pinned Event */}
        <PinnedEventBanner event={MOCK_EVENT} />

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ideas Recientes</Text>
          <View style={styles.ideaCountBadge}>
            <Text style={styles.ideaCount}>{ideas.length}</Text>
          </View>
        </View>
      </>
    ),
    [ideas.length]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>💡</Text>
        <Text style={styles.emptyTitle}>Sin ideas aún</Text>
        <Text style={styles.emptySubtitle}>
          Toca el botón + para capturar tu primera idea
        </Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IdeaCard idea={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <QuickCaptureModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveIdea}
        activeEvent={MOCK_EVENT}
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
  orgName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
