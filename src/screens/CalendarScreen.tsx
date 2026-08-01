import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { IdeaCard } from '../components/IdeaCard';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { Idea, PinnedEvent } from '../types';

export const CalendarScreen: React.FC = () => {
  const { ideas, events } = useData();

  type CalendarItem = 
    | { type: 'idea'; data: Idea; date: Date }
    | { type: 'event'; data: PinnedEvent; date: Date };

  // Combine ideas with scheduledDate and events with targetDate
  const calendarItems = useMemo(() => {
    const items: CalendarItem[] = [];
    
    ideas.forEach(idea => {
      if (idea.scheduledDate) {
        items.push({ type: 'idea', data: idea, date: new Date(idea.scheduledDate) });
      }
    });

    events.forEach(event => {
      if (event.targetDate) {
        items.push({ type: 'event', data: event, date: new Date(event.targetDate) });
      }
    });

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [ideas, events]);

  // Group by day using a precise key that includes the year
  const groupedByDay = useMemo(() => {
    const groups: Record<string, CalendarItem[]> = {};
    
    calendarItems.forEach((item) => {
      const dateKey = item.date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return Object.entries(groups).map(([dateKey, items]) => ({
      dateKey,
      items,
    }));
  }, [calendarItems]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>Sin contenido programado</Text>
      <Text style={styles.emptySubtitle}>
        Programa ideas con una fecha o crea eventos para verlos aquí.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario Editorial</Text>
      </View>

      <FlatList
        data={groupedByDay}
        keyExtractor={(item) => item.dateKey}
        renderItem={({ item }) => (
          <View style={styles.dayGroup}>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar-clear-outline" size={16} color={colors.accentLight} />
              <Text style={styles.dateText}>{item.dateKey.charAt(0).toUpperCase() + item.dateKey.slice(1)}</Text>
            </View>
            {item.items.map((calendarItem) => {
              if (calendarItem.type === 'idea') {
                return (
                  <IdeaCard 
                    key={`idea-${calendarItem.data.id}`} 
                    idea={calendarItem.data} 
                    event={events.find((e) => e.id === calendarItem.data.eventId)} 
                  />
                );
              } else {
                // Render a compact banner for the event
                const evt = calendarItem.data;
                return (
                  <View key={`evt-${evt.id}`} style={styles.calendarEventCard}>
                    <Ionicons name={evt.icon as any} size={20} color={evt.gradientColors[0]} />
                    <Text style={styles.calendarEventTitle}>Campaña: {evt.title}</Text>
                  </View>
                );
              }
            })}
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: spacing.lg,
  },
  dayGroup: {
    marginBottom: spacing.xxl,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  dateText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.accentLight,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
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
  calendarEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  calendarEventTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
