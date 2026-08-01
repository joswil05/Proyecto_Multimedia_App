import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { PinnedEvent } from '../types';
import { EVENT_GRADIENTS, EVENT_ICONS } from '../constants/events';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  events: PinnedEvent[];
  pinnedEventId: string | null;
  onCreateEvent: (event: Omit<PinnedEvent, 'id' | 'completedContent'>) => void;
  onPinEvent: (eventId: string | null) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const EventManagerModal: React.FC<Props> = ({
  visible,
  onClose,
  events,
  pinnedEventId,
  onCreateEvent,
  onPinEvent,
  onDeleteEvent,
}) => {
  const [mode, setMode] = useState<'list' | 'create'>('list');

  // Create form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(EVENT_ICONS[0]);
  const [selectedGradient, setSelectedGradient] = useState(EVENT_GRADIENTS[0]);
  const [contentGoal, setContentGoal] = useState('10');

  // Auto-switch to create mode when no events exist
  useEffect(() => {
    if (visible && events.length === 0) {
      setMode('create');
    }
  }, [visible, events.length]);

  const resetForm = () => {
    setTitle('');
    setDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setShowDatePicker(false);
    setSelectedIcon(EVENT_ICONS[0]);
    setSelectedGradient(EVENT_GRADIENTS[0]);
    setContentGoal('10');
    setMode('list');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onCreateEvent({
      title: title.trim(),
      icon: selectedIcon,
      gradientColors: selectedGradient.colors,
      targetDate: date,
      totalContentGoal: parseInt(contentGoal) || 10,
    });

    resetForm();
  };

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const canSave = title.trim().length > 0;

  // ── List View ────────────────────────────────────────────────────────
  const renderListMode = () => (
    <>
      {events.length > 0 ? (
        events.map((evt) => (
          <View key={evt.id} style={styles.eventItem}>
            <TouchableOpacity
              style={[
                styles.eventCard,
                pinnedEventId === evt.id && styles.eventCardActive,
              ]}
              onPress={() => onPinEvent(pinnedEventId === evt.id ? null : evt.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.eventIconSmall,
                  { backgroundColor: evt.gradientColors[0] + '30' },
                ]}
              >
                <Ionicons name={evt.icon as any} size={20} color={evt.gradientColors[0]} />
              </View>
              <View style={styles.eventCardInfo}>
                <Text style={styles.eventCardTitle}>{evt.title}</Text>
                <Text style={styles.eventCardDate}>{formatDate(evt.targetDate)}</Text>
              </View>
              {pinnedEventId === evt.id ? (
                <View style={styles.pinnedBadge}>
                  <Ionicons name="pin" size={14} color={colors.accent} />
                </View>
              ) : (
                <Ionicons name="pin-outline" size={18} color={colors.textMuted} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeleteEvent(evt.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyList}>
          <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyListText}>No hay eventos creados</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.createNewButton}
        onPress={() => setMode('create')}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
        <Text style={styles.createNewButtonText}>Crear Nuevo Evento</Text>
      </TouchableOpacity>
    </>
  );

  // ── Create View ──────────────────────────────────────────────────────
  const renderCreateMode = () => (
    <>
      {events.length > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('list')}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backButtonText}>Volver a la lista</Text>
        </TouchableOpacity>
      )}

      {/* Name */}
      <Text style={styles.fieldLabel}>Nombre del evento</Text>
      <TextInput
        style={styles.textInput}
        placeholder="ej. Conferencia de Jóvenes 2026"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      {/* Date */}
      <Text style={styles.fieldLabel}>Fecha del evento</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
          themeVariant="dark"
        />
      )}

      {/* Icon Selector */}
      <Text style={styles.fieldLabel}>Ícono</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectorScroll}
        contentContainerStyle={styles.selectorContent}
      >
        {EVENT_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconOption,
              selectedIcon === icon && {
                backgroundColor: selectedGradient.colors[0] + '30',
                borderColor: selectedGradient.colors[0],
              },
            ]}
            onPress={() => setSelectedIcon(icon)}
          >
            <Ionicons
              name={icon as any}
              size={22}
              color={selectedIcon === icon ? selectedGradient.colors[0] : colors.textMuted}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Color Selector */}
      <Text style={styles.fieldLabel}>Color</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectorScroll}
        contentContainerStyle={styles.selectorContent}
      >
        {EVENT_GRADIENTS.map((gradient) => (
          <TouchableOpacity
            key={gradient.id}
            style={[
              styles.colorOption,
              selectedGradient.id === gradient.id && styles.colorOptionSelected,
            ]}
            onPress={() => setSelectedGradient(gradient)}
          >
            <View style={[styles.colorCircle, { backgroundColor: gradient.colors[0] }]} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content Goal */}
      <Text style={styles.fieldLabel}>Meta de contenidos</Text>
      <TextInput
        style={styles.textInput}
        placeholder="10"
        placeholderTextColor={colors.textMuted}
        value={contentGoal}
        onChangeText={setContentGoal}
        keyboardType="number-pad"
      />

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!canSave}
        activeOpacity={0.8}
      >
        <Ionicons
          name="bookmark-outline"
          size={20}
          color={canSave ? '#FFFFFF' : colors.textMuted}
        />
        <Text style={[styles.saveButtonText, !canSave && styles.saveButtonTextDisabled]}>
          Guardar y Fijar Evento
        </Text>
      </TouchableOpacity>
    </>
  );

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {mode === 'list' ? 'Eventos Especiales' : 'Nuevo Evento'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {mode === 'list' ? renderListMode() : renderCreateMode()}
            <View style={{ height: spacing.xxl }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    maxHeight: '88%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.surfaceBright,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.xl },

  // ── List Mode ──
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  eventCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  eventCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },
  eventIconSmall: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCardInfo: { flex: 1 },
  eventCardTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  eventCardDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  pinnedBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyListText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  createNewButtonText: {
    fontSize: fontSize.md,
    color: colors.accent,
    fontWeight: '600',
  },

  // ── Create Mode ──
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  backButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  dateButtonText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  selectorScroll: { marginBottom: spacing.lg },
  selectorContent: { gap: spacing.md },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: { borderColor: colors.textPrimary },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  saveButtonDisabled: { backgroundColor: colors.surfaceElevated },
  saveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: { color: colors.textMuted },
});
