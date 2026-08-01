import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PinnedEvent } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  event: PinnedEvent;
}

export const PinnedEventBanner: React.FC<Props> = ({ event }) => {
  const daysLeft = Math.max(
    0,
    Math.ceil((event.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const progress = Math.min(event.completedContent / event.totalContentGoal, 1);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{event.emoji}</Text>
        <View style={styles.countdown}>
          <Text style={styles.daysNumber}>{daysLeft}</Text>
          <Text style={styles.daysLabel}>días</Text>
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
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 36,
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
});
