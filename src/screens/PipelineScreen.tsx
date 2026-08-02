import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { Idea, IdeaStatus, STATUS_CONFIG, ContentPillar } from '../types';
import { PILLARS_CONFIG } from '../constants/pillars';
import { IdeaCard } from '../components/IdeaCard';
import { IdeaDetailModal } from '../components/IdeaDetailModal';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { triggerSelectionHaptic } from '../utils/haptics';

const PIPELINE_STATUSES: IdeaStatus[] = ['idea', 'script', 'editing', 'review', 'ready'];

export const PipelineScreen: React.FC = () => {
  const { ideas, events } = useData();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [filterPillar, setFilterPillar] = useState<ContentPillar | null>(null);

  const filteredIdeas = filterPillar ? ideas.filter(i => i.pillar === filterPillar) : ideas;

  const handleIdeaPress = (ideaId: string) => {
    triggerSelectionHaptic();
    setSelectedIdeaId(ideaId);
    setDetailVisible(true);
  };

  // Render a column for each status
  const renderColumn = (status: IdeaStatus) => {
    const config = STATUS_CONFIG[status];
    const columnIdeas = filteredIdeas.filter(i => i.status === status);

    return (
      <View key={status} style={styles.column}>
        <View style={styles.columnHeader}>
          <View style={styles.columnHeaderLeft}>
            <Ionicons name={config.icon as any} size={20} color={config.color} />
            <Text style={styles.columnTitle}>{config.label}</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{columnIdeas.length}</Text>
          </View>
        </View>

        <FlatList
          data={columnIdeas}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.columnList}
          renderItem={({ item, index }) => (
            <IdeaCard
              idea={item}
              event={events.find(e => e.id === item.eventId)}
              onPress={() => handleIdeaPress(item.id)}
              index={index}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyColumn}>
              <Text style={styles.emptyText}>Sin ideas</Text>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Producción</Text>
        <Text style={styles.headerSubtitle}>Pipeline de contenido creativo</Text>
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

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.kanbanContainer}
        snapToInterval={300 + spacing.md}
        decelerationRate="fast"
      >
        {PIPELINE_STATUSES.map(renderColumn)}
      </ScrollView>

      <IdeaDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        ideaId={selectedIdeaId}
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
  kanbanContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: 100,
  },
  filterScroll: {
    maxHeight: 40,
    marginBottom: spacing.md,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.xl,
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
  column: {
    width: 300, // Fixed width for each kanban column
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  columnHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  columnTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
  },
  columnList: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyColumn: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.md,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
