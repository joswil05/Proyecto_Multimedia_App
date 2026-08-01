import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PinnedEvent } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;
const SNAP_INTERVAL = CARD_WIDTH + spacing.md;

interface Props {
  events: PinnedEvent[];
  onEventPress: (event: PinnedEvent) => void;
  onCreateEvent: () => void;
}

export const EventsCarousel: React.FC<Props> = ({ events, onEventPress, onCreateEvent }) => {
  const renderItem = ({ item }: { item: PinnedEvent | 'create' }) => {
    if (item === 'create') {
      return (
        <TouchableOpacity
          style={[styles.card, styles.createCard, { width: CARD_WIDTH }]}
          onPress={onCreateEvent}
          activeOpacity={0.8}
        >
          <View style={styles.createIconContainer}>
            <Ionicons name="add" size={24} color={colors.textMuted} />
          </View>
          <Text style={styles.createText}>Crear Evento Especial</Text>
        </TouchableOpacity>
      );
    }

    const event = item as PinnedEvent;
    const progress = Math.min((event.completedContent / event.totalContentGoal) * 100, 100);
    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(event.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    return (
      <TouchableOpacity
        style={[styles.card, { width: CARD_WIDTH }]}
        onPress={() => onEventPress(event)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={event.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <Ionicons name={event.icon as any} size={20} color={colors.textPrimary} />
            </View>
            <View style={styles.daysBadge}>
              <Ionicons name="time-outline" size={14} color={colors.textPrimary} />
              <Text style={styles.daysText}>{daysLeft} días</Text>
            </View>
          </View>
          
          <Text style={styles.title}>{event.title}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                {event.completedContent} / {event.totalContentGoal} listos
              </Text>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const data: Array<PinnedEvent | 'create'> = [...events, 'create'];

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => (item === 'create' ? 'create' : item.id)}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  createCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  createIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  daysText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressContainer: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    opacity: 0.9,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: 2,
  },
});
