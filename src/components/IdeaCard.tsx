import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Idea, PinnedEvent, STATUS_CONFIG } from '../types';
import { ChannelBadge } from './ChannelBadge';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  idea: Idea;
  event?: PinnedEvent;
  onPress?: () => void;
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

export const IdeaCard: React.FC<Props> = ({ idea, event, onPress }) => {
  const statusConfig = STATUS_CONFIG[idea.status];
  const timeAgo = getTimeAgo(idea.createdAt);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {event && (
        <View style={styles.eventBadge}>
          <Ionicons name={event.icon as any} size={12} color={colors.accentLight} />
          <Text style={styles.eventBadgeText}>{event.title}</Text>
        </View>
      )}

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
          <Text style={styles.aiText}>Gemini AI</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
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
  time: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
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
    marginBottom: spacing.sm,
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
});
