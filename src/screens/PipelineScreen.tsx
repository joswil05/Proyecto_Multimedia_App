import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { Idea, IdeaStatus, STATUS_CONFIG } from '../types';
import { IdeaCard } from '../components/IdeaCard';
import { IdeaDetailModal } from '../components/IdeaDetailModal';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

const PIPELINE_STATUSES: IdeaStatus[] = ['idea', 'script', 'editing', 'review', 'ready'];

export const PipelineScreen: React.FC = () => {
  const { ideas, events } = useData();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const handleIdeaPress = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setDetailVisible(true);
  };

  // Render a column for each status
  const renderColumn = (status: IdeaStatus) => {
    const config = STATUS_CONFIG[status];
    const columnIdeas = ideas.filter(i => i.status === status);

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
          renderItem={({ item }) => (
            <IdeaCard
              idea={item}
              event={events.find(e => e.id === item.eventId)}
              onPress={() => handleIdeaPress(item.id)}
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
