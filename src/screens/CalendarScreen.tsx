import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { IdeaCard } from '../components/IdeaCard';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { Idea } from '../types';

export const CalendarScreen: React.FC = () => {
  const { ideas, events } = useData();

  // Obtener solo las ideas que tienen una fecha programada y ordenarlas cronológicamente
  const scheduledIdeas = useMemo(() => {
    return ideas
      .filter((i) => i.scheduledDate)
      .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());
  }, [ideas]);

  // Agrupar por día para mostrar en secciones (simulado con FlatList)
  const groupedByDay = useMemo(() => {
    const groups: Record<string, Idea[]> = {};
    scheduledIdeas.forEach((idea) => {
      const dateKey = new Date(idea.scheduledDate!).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(idea);
    });

    return Object.entries(groups).map(([dateKey, items]) => ({
      dateKey,
      items,
    }));
  }, [scheduledIdeas]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
      <Text style={styles.emptyTitle}>Sin contenido programado</Text>
      <Text style={styles.emptySubtitle}>
        Programa ideas con una fecha para verlas organizadas aquí.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
            {item.items.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} event={events.find((e) => e.id === idea.eventId)} />
            ))}
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
});
