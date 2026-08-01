import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PinnedEvent } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  event: PinnedEvent | null;
  onManageEvents: () => void;
}

export const PinnedEventBanner: React.FC<Props> = ({ event, onManageEvents }) => {
  // ── Empty State ──────────────────────────────────────────────────────
  if (!event) {
    return (
      <TouchableOpacity
        style={styles.emptyContainer}
        onPress={onManageEvents}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Sin evento fijado actualmente</Text>
        <View style={styles.createButton}>
          <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
          <Text style={styles.createButtonText}>Crear Evento Especial</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ── Active Event ─────────────────────────────────────────────────────
  const daysLeft = Math.max(
    0,
    Math.ceil((event.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const progress = Math.min(event.completedContent / event.totalContentGoal, 1);

  return (
    <LinearGradient
      colors={event.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={event.icon as any} size={28} color="#FFFFFF" />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onManageEvents}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View style={styles.countdown}>
            <Text style={styles.daysNumber}>{daysLeft}</Text>
            <Text style={styles.daysLabel}>días</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {event.completedContent}/{event.totalContentGoal} contenidos listos
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // Active state
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  daysNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  daysLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  progressSection: {
    gap: spacing.sm,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  // Empty state
  emptyContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  createButtonText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '600',
  },
});
