import React from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PinnedEvent, Idea } from '../types';
import { useData } from '../context/DataContext';
import { IdeaCard } from './IdeaCard';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  event: PinnedEvent | null;
}

export const EventDetailModal: React.FC<Props> = ({ visible, onClose, event }) => {
  const { ideas } = useData();

  if (!event) return null;

  const eventIdeas = ideas.filter((idea) => idea.eventId === event.id);
  const progress = Math.min((event.completedContent / event.totalContentGoal) * 100, 100);
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(event.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const renderHeader = () => (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={event.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Ionicons name={event.icon as any} size={28} color={colors.textPrimary} />
          </View>
          <View style={styles.daysBadge}>
            <Ionicons name="time-outline" size={16} color={colors.textPrimary} />
            <Text style={styles.daysText}>{daysLeft} días restantes</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {event.completedContent} de {event.totalContentGoal} contenidos
            </Text>
            <Text style={styles.progressText}>{Math.round(progress)}% completado</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>Sin ideas asociadas</Text>
      <Text style={styles.emptySubtitle}>
        Las ideas que vincules a este evento aparecerán aquí.
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Contenidos del Evento</Text>
          <FlatList
            data={eventIdeas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <IdeaCard idea={item} event={event} />}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bannerContainer: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    minHeight: 220,
    justifyContent: 'flex-end',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  daysText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    opacity: 0.9,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: 3,
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    padding: spacing.xl,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
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
