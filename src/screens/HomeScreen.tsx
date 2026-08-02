import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
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
import { useAuth } from '../context/AuthContext';
import { PinnedEvent, ContentPillar } from '../types';
import { PILLARS_CONFIG } from '../constants/pillars';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { triggerSelectionHaptic, triggerLightHaptic } from '../utils/haptics';

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
  const { signOut } = useAuth();

  // Modal states
  const [captureModalVisible, setCaptureModalVisible] = useState(false);
  const [eventManagerVisible, setEventManagerVisible] = useState(false);
  const [eventDetailVisible, setEventDetailVisible] = useState(false);
  const [ideaDetailVisible, setIdeaDetailVisible] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<PinnedEvent | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [filterPillar, setFilterPillar] = useState<ContentPillar | null>(null);

  // Strategic Balance Calculations
  const totalIdeas = ideas.length;
  const pillarCounts = ideas.reduce((acc, idea) => {
    if (idea.pillar) {
      acc[idea.pillar] = (acc[idea.pillar] || 0) + 1;
    } else {
      acc.unassigned = (acc.unassigned || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const promotionalCount = pillarCounts['promocional'] || 0;
  const promotionalPercentage = totalIdeas > 0 ? (promotionalCount / totalIdeas) * 100 : 0;
  const showPromoWarning = promotionalPercentage > 35;

  const filteredIdeas = filterPillar ? ideas.filter(i => i.pillar === filterPillar) : ideas;

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleEventPress = (event: PinnedEvent) => {
    setSelectedEvent(event);
    setEventDetailVisible(true);
  };

  const handleIdeaPress = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setIdeaDetailVisible(true);
  };

  const handleSettingsPress = () => {
    Alert.alert(
      'Ajustes',
      '¿Qué deseas hacer?',
      [
        { text: 'Administrar Eventos', onPress: () => setEventManagerVisible(true) },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: signOut },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
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
            onPress={handleSettingsPress}
          />
        </View>

        <EventsCarousel
          events={events}
          onEventPress={handleEventPress}
          onCreateEvent={() => setEventManagerVisible(true)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Balance Estratégico</Text>
        </View>
        
        <View style={styles.balanceWidget}>
          <View style={styles.balanceBar}>
            {totalIdeas > 0 ? (
              <>
                {(Object.entries(PILLARS_CONFIG) as [ContentPillar, typeof PILLARS_CONFIG[ContentPillar]][]).map(([key, config]) => {
                  const count = pillarCounts[key] || 0;
                  if (count === 0) return null;
                  return <View key={key} style={{ flex: count, backgroundColor: config.color, height: 8 }} />;
                })}
                {pillarCounts.unassigned > 0 && (
                  <View style={{ flex: pillarCounts.unassigned, backgroundColor: colors.surfaceBright, height: 8 }} />
                )}
              </>
            ) : (
              <View style={{ flex: 1, backgroundColor: colors.surfaceBright, height: 8 }} />
            )}
          </View>
          
          <View style={styles.balanceStats}>
            {(Object.entries(PILLARS_CONFIG) as [ContentPillar, typeof PILLARS_CONFIG[ContentPillar]][]).map(([key, config]) => {
                const count = pillarCounts[key] || 0;
                if (count === 0) return null;
                const percentage = Math.round((count / totalIdeas) * 100);
                return (
                  <View key={key} style={styles.balanceStatItem}>
                    <View style={[styles.balanceDot, { backgroundColor: config.color }]} />
                    <Text style={styles.balanceStatText}>{percentage}% {config.label}</Text>
                  </View>
                );
            })}
          </View>
          
          {showPromoWarning && (
            <View style={styles.promoWarning}>
              <Ionicons name="warning" size={14} color={colors.warning} />
              <Text style={styles.promoWarningText}>
                Contenido promocional excede el 35% ({Math.round(promotionalPercentage)}%). Se recomienda balancear.
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={styles.sectionTitle}>Ideas Recientes</Text>
          <View style={styles.ideaCountBadge}>
            <Text style={styles.ideaCount}>{filteredIdeas.length}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
          <TouchableOpacity style={[styles.filterChip, filterPillar === null && styles.filterChipActive]} onPress={() => { triggerSelectionHaptic(); setFilterPillar(null); }}>
            <Text style={[styles.filterChipText, filterPillar === null && styles.filterChipTextActive]}>Todas</Text>
          </TouchableOpacity>
          {(Object.entries(PILLARS_CONFIG) as [ContentPillar, typeof PILLARS_CONFIG[ContentPillar]][]).map(([key, config]) => (
            <TouchableOpacity key={key} style={[styles.filterChip, filterPillar === key && { backgroundColor: config.color, borderColor: config.color }]} onPress={() => { triggerSelectionHaptic(); setFilterPillar(key); }}>
              <Ionicons name={config.icon as any} size={14} color={filterPillar === key ? '#FFF' : colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.filterChipText, filterPillar === key && { color: '#FFF' }]}>{config.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </>
    ),
    [events, ideas, filteredIdeas.length, filterPillar, pillarCounts, totalIdeas, promotionalPercentage, showPromoWarning]
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
        data={filteredIdeas}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <IdeaCard
            idea={item}
            event={events.find((e) => e.id === item.eventId)}
            onPress={() => handleIdeaPress(item.id)}
            index={index}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton onPress={() => { triggerLightHaptic(); setCaptureModalVisible(true); }} />

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
    borderRadius: borderRadius.md,
  },
  balanceWidget: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  balanceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  balanceStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceStatText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  promoWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.sm,
  },
  promoWarningText: {
    fontSize: fontSize.xs,
    color: colors.warning,
    flex: 1,
  },
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.background,
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
