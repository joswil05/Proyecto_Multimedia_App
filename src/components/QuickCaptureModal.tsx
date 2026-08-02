import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { Channel, Idea, PinnedEvent, ContentPillar } from '../types';
import { CHANNELS } from '../constants/channels';
import { PILLARS_CONFIG } from '../constants/pillars';
import { ChannelChip } from './ChannelChip';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { triggerSuccessHaptic, triggerSelectionHaptic } from '../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (idea: Omit<Idea, 'id' | 'createdAt' | 'status'>) => void;
  events: PinnedEvent[];
  pinnedEventId: string | null;
}

export const QuickCaptureModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  events,
  pinnedEventId,
}) => {
  const [text, setText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(pinnedEventId);
  const [selectedPillar, setSelectedPillar] = useState<ContentPillar | undefined>(undefined);
  const [useAI, setUseAI] = useState(true);

  useEffect(() => {
    if (visible) {
      setSelectedEventId(pinnedEventId);
    }
  }, [visible, pinnedEventId]);

  const toggleChannel = (channel: Channel) => {
    triggerSelectionHaptic();
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const resetForm = () => {
    setText('');
    setSelectedChannels([]);
    setSelectedEventId(null);
    setSelectedPillar(undefined);
    setUseAI(true);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    triggerSuccessHaptic();
    onSave({
      text: text.trim(),
      channels: selectedChannels,
      eventId: selectedEventId || undefined,
      useAI,
      pillar: selectedPillar,
    });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canSave = text.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View 
          style={styles.sheet}
          entering={SlideInUp.springify()} 
          exiting={SlideOutDown.springify()}
        >
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="bulb-outline" size={22} color={colors.warning} />
              <Text style={styles.headerTitle}>Nueva Idea</Text>
            </View>
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
            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              placeholder="¿Qué idea tienes para contenido?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
              autoFocus
            />

            {/* Dynamic Event Selector */}
            {events.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Vincular a evento</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.eventScroll}
                  contentContainerStyle={styles.eventScrollContent}
                >
                  {/* "No event" option */}
                  <TouchableOpacity
                    style={[styles.eventChip, !selectedEventId && styles.eventChipNone]}
                    onPress={() => { triggerSelectionHaptic(); setSelectedEventId(null); }}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={16}
                      color={!selectedEventId ? colors.textPrimary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.eventChipText,
                        !selectedEventId && styles.eventChipTextActive,
                      ]}
                    >
                      Sin evento
                    </Text>
                  </TouchableOpacity>

                  {/* Dynamic event list */}
                  {events.map((evt) => (
                    <TouchableOpacity
                      key={evt.id}
                      style={[
                        styles.eventChip,
                        selectedEventId === evt.id && {
                          backgroundColor: evt.gradientColors[0] + '25',
                          borderColor: evt.gradientColors[0],
                        },
                      ]}
                      onPress={() => { triggerSelectionHaptic(); setSelectedEventId(evt.id); }}
                    >
                      <Ionicons
                        name={evt.icon as any}
                        size={16}
                        color={
                          selectedEventId === evt.id
                            ? evt.gradientColors[0]
                            : colors.textMuted
                        }
                      />
                      <Text
                        style={[
                          styles.eventChipText,
                          selectedEventId === evt.id && {
                            color: evt.gradientColors[0],
                          },
                        ]}
                      >
                        {evt.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Pillar Chips */}
            <Text style={styles.sectionLabel}>Pilar Estratégico</Text>
            <View style={styles.pillarGrid}>
              {(Object.entries(PILLARS_CONFIG) as [ContentPillar, typeof PILLARS_CONFIG[ContentPillar]][]).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.eventChip,
                    selectedPillar === key && {
                      backgroundColor: config.color + '25',
                      borderColor: config.color,
                    },
                  ]}
                  onPress={() => { triggerSelectionHaptic(); setSelectedPillar(selectedPillar === key ? undefined : key); }}
                >
                  <Ionicons
                    name={config.icon as any}
                    size={16}
                    color={
                      selectedPillar === key
                        ? config.color
                        : colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.eventChipText,
                      selectedPillar === key && {
                        color: config.color,
                      },
                    ]}
                  >
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Channel Chips */}
            <Text style={styles.sectionLabel}>Canales de publicación</Text>
            <View style={styles.channelsGrid}>
              {CHANNELS.map((ch) => (
                <ChannelChip
                  key={ch.key}
                  config={ch}
                  selected={selectedChannels.includes(ch.key)}
                  onToggle={() => toggleChannel(ch.key)}
                />
              ))}
            </View>

            {/* AI Switch */}
            <View style={styles.aiSwitch}>
              <View style={styles.aiSwitchInfo}>
                <Ionicons name="sparkles-outline" size={18} color={colors.accentLight} />
                <Text style={styles.aiSwitchText}>
                  Generar ganchos y borrador con Gemini AI
                </Text>
              </View>
              <Switch
                value={useAI}
                onValueChange={(val) => { triggerSelectionHaptic(); setUseAI(val); }}
                trackColor={{ false: colors.surfaceBright, true: colors.accentLight }}
                thumbColor={useAI ? colors.accent : colors.textMuted}
                ios_backgroundColor={colors.surfaceBright}
              />
            </View>
          </ScrollView>

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
            <Text
              style={[styles.saveButtonText, !canSave && styles.saveButtonTextDisabled]}
            >
              Guardar Idea
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#09090B' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#09090B' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.xl,
    maxHeight: '85%',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  textInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventScroll: { marginBottom: spacing.xl },
  eventScrollContent: { gap: spacing.sm, paddingRight: spacing.xl },
  eventChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    gap: 6,
  },
  eventChipNone: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.surfaceBright,
  },
  eventChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  eventChipTextActive: {
    color: colors.accentLight,
    fontWeight: '700',
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  channelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  aiSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  aiSwitchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.md,
  },
  aiSwitchText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#7C3AED',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
  },
  saveButtonDisabled: { backgroundColor: colors.surfaceElevated },
  saveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: { color: colors.textMuted },
});
