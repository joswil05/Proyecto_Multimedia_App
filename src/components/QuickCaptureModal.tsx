import React, { useState } from 'react';
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
import { Channel, Idea, PinnedEvent } from '../types';
import { CHANNELS } from '../constants/channels';
import { ChannelChip } from './ChannelChip';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (idea: Omit<Idea, 'id' | 'createdAt' | 'status'>) => void;
  activeEvent: PinnedEvent | null;
}

export const QuickCaptureModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  activeEvent,
}) => {
  const [text, setText] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([]);
  const [linkToEvent, setLinkToEvent] = useState(false);
  const [useAI, setUseAI] = useState(true);

  const toggleChannel = (channel: Channel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSave = () => {
    if (!text.trim()) return;

    onSave({
      text: text.trim(),
      channels: selectedChannels,
      eventId: linkToEvent && activeEvent ? activeEvent.id : undefined,
      useAI,
    });

    // Reset form
    setText('');
    setSelectedChannels([]);
    setLinkToEvent(false);
    setUseAI(true);
  };

  const handleClose = () => {
    setText('');
    setSelectedChannels([]);
    setLinkToEvent(false);
    setUseAI(true);
    onClose();
  };

  const canSave = text.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet */}
        <View style={styles.sheet}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>💡 Nueva Idea</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
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

            {/* Link to Event */}
            {activeEvent && (
              <TouchableOpacity
                style={[
                  styles.eventLink,
                  linkToEvent && styles.eventLinkActive,
                ]}
                onPress={() => setLinkToEvent(!linkToEvent)}
                activeOpacity={0.7}
              >
                <Text style={styles.eventEmoji}>{activeEvent.emoji}</Text>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventLabel}>
                    {linkToEvent ? 'Vinculada a:' : 'Vincular a evento:'}
                  </Text>
                  <Text style={styles.eventTitle}>{activeEvent.title}</Text>
                </View>
                <View
                  style={[
                    styles.eventCheck,
                    linkToEvent && styles.eventCheckActive,
                  ]}
                >
                  {linkToEvent && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            )}

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
                <Text style={styles.aiSwitchEmoji}>✨</Text>
                <Text style={styles.aiSwitchText}>
                  Generar ganchos y borrador con Gemini AI
                </Text>
              </View>
              <Switch
                value={useAI}
                onValueChange={setUseAI}
                trackColor={{
                  false: colors.surfaceBright,
                  true: colors.accentLight,
                }}
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
            <Text
              style={[
                styles.saveButtonText,
                !canSave && styles.saveButtonTextDisabled,
              ]}
            >
              💾 Guardar Idea
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
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
  closeText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.xl,
  },
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
  eventLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  eventLinkActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSubtle,
  },
  eventEmoji: {
    fontSize: 24,
  },
  eventInfo: {
    flex: 1,
  },
  eventLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  eventTitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  eventCheck: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCheckActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  aiSwitchEmoji: {
    fontSize: 18,
  },
  aiSwitchText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.accent,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
  },
  saveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: colors.textMuted,
  },
});
