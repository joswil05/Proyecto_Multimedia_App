import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Idea, IdeaStatus, STATUS_CONFIG, Channel } from '../types';
import { useData } from '../context/DataContext';
import { ChannelBadge } from './ChannelBadge';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  ideaId: string | null;
}

const PIPELINE_STATUSES: IdeaStatus[] = ['idea', 'script', 'editing', 'review', 'ready'];

export const IdeaDetailModal: React.FC<Props> = ({ visible, onClose, ideaId }) => {
  const { ideas, events, updateIdea, deleteIdea } = useData();
  const idea = ideas.find((i) => i.id === ideaId);

  const [copyText, setCopyText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (idea) {
      setCopyText(idea.copyText || '');
    }
  }, [idea]);

  if (!idea) return null;

  const event = events.find((e) => e.id === idea.eventId);

  const handleStatusChange = (status: IdeaStatus) => {
    updateIdea(idea.id, { status });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      updateIdea(idea.id, { scheduledDate: date });
    }
  };

  const handleSaveCopy = () => {
    updateIdea(idea.id, { copyText });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(copyText);
    Alert.alert('¡Copiado!', 'El copy se ha copiado al portapapeles.');
  };

  const handleDelete = () => {
    Alert.alert('Eliminar Idea', '¿Estás seguro de que deseas eliminar esta idea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteIdea(idea.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Idea</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Idea Text */}
          <Text style={styles.ideaText}>{idea.text}</Text>

          {/* Event Badge */}
          {event && (
            <View style={styles.eventBadge}>
              <Ionicons name={event.icon as any} size={16} color={colors.accentLight} />
              <Text style={styles.eventBadgeText}>{event.title}</Text>
            </View>
          )}

          {/* Status Pipeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estado (Pipeline)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pipelineContainer}>
              {PIPELINE_STATUSES.map((status) => {
                const config = STATUS_CONFIG[status];
                const isActive = idea.status === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.pipelineChip,
                      isActive && { backgroundColor: config.color, borderColor: config.color },
                    ]}
                    onPress={() => handleStatusChange(status)}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={16}
                      color={isActive ? colors.background : config.color}
                    />
                    <Text style={[styles.pipelineText, isActive && { color: colors.background }]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Schedule Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fecha Programada</Text>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} />
              <Text style={styles.dateText}>
                {idea.scheduledDate
                  ? idea.scheduledDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })
                  : 'Sin fecha asignada'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={idea.scheduledDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Channels */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Canales Seleccionados</Text>
            <View style={styles.channelsContainer}>
              {idea.channels.length > 0 ? (
                idea.channels.map((ch) => <ChannelBadge key={ch} channel={ch} />)
              ) : (
                <Text style={styles.noChannels}>No hay canales seleccionados</Text>
              )}
            </View>
          </View>

          {/* AI Hooks & Copy */}
          <View style={styles.section}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color={colors.accentLight} />
              <Text style={styles.sectionTitle}>IA & Copy</Text>
            </View>

            {idea.aiHooks && idea.aiHooks.length > 0 && (
              <View style={styles.hooksContainer}>
                <Text style={styles.hooksTitle}>Ganchos Sugeridos:</Text>
                {idea.aiHooks.map((hook, index) => (
                  <View key={index} style={styles.hookItem}>
                    <Text style={styles.hookText}>• {hook}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.copyContainer}>
              <TextInput
                style={styles.copyInput}
                multiline
                value={copyText}
                onChangeText={setCopyText}
                placeholder="Escribe el copy final aquí..."
                placeholderTextColor={colors.textMuted}
                onBlur={handleSaveCopy}
              />
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={20} color={colors.background} />
                <Text style={styles.copyButtonText}>Copiar al Portapapeles</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  iconButton: {
    padding: spacing.sm,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 80,
  },
  ideaText: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSubtle,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  eventBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.accentLight,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  pipelineContainer: {
    gap: spacing.sm,
  },
  pipelineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6,
  },
  pipelineText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  dateText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  channelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  noChannels: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hooksContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  hooksTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  hookItem: {
    marginBottom: spacing.xs,
  },
  hookText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  copyContainer: {
    gap: spacing.md,
  },
  copyInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.textPrimary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  copyButtonText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
