import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Idea, PinnedEvent, STATUS_CONFIG } from '../types';
import { PILLARS_CONFIG } from '../constants/pillars';
import { ChannelBadge } from './ChannelBadge';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, FadeInDown } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  idea: Idea;
  event?: PinnedEvent;
  onPress?: () => void;
  index?: number;
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export const IdeaCard: React.FC<Props> = ({ idea, event, onPress, index = 0 }) => {
  const statusConfig = STATUS_CONFIG[idea.status];
  const timeAgo = getTimeAgo(idea.createdAt);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <AnimatedTouchableOpacity
        style={[styles.card, animatedStyle]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 100 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 100 });
        }}
        activeOpacity={0.9}
      >
        <Text style={styles.time}>{timeAgo}</Text>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>

        <View style={styles.badgesRow}>
          {event && (
            <View style={styles.eventBadge}>
              <Ionicons name={event.icon as any} size={12} color={colors.accentLight} />
              <Text style={styles.eventBadgeText}>{event.title}</Text>
            </View>
          )}

          {idea.pillar && PILLARS_CONFIG[idea.pillar] && (
            <View style={[styles.pillarBadge, { backgroundColor: PILLARS_CONFIG[idea.pillar].color + '15' }]}>
              <Ionicons name={PILLARS_CONFIG[idea.pillar].icon as any} size={12} color={PILLARS_CONFIG[idea.pillar].color} />
              <Text style={[styles.pillarBadgeText, { color: PILLARS_CONFIG[idea.pillar].color }]}>
                {PILLARS_CONFIG[idea.pillar].label}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.ideaText}>{idea.text}</Text>

        {idea.channels.length > 0 && (
          <View style={styles.channels}>
            {idea.channels.map((ch) => (
              <ChannelBadge key={ch} channel={ch} />
            ))}
          </View>
        )}

        {idea.useAI && (
          <View style={styles.aiIndicator}>
            <Ionicons name="sparkles-outline" size={12} color={colors.accentLight} />
            <Text style={styles.aiText}>Asistente</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
        )}
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ideaText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  channels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  aiText: {
    fontSize: fontSize.xs,
    color: colors.accentLight,
    fontWeight: '500',
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentSubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  eventBadgeText: {
    fontSize: fontSize.xs,
    color: colors.accentLight,
    fontWeight: '600',
  },
  pillarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  pillarBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
