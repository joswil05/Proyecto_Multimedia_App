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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Idea, IdeaStatus, STATUS_CONFIG } from '../types';
import { useData } from '../context/DataContext';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  ideaId: string | null;
}

const PIPELINE_STATUSES: IdeaStatus[] = ['idea', 'script', 'editing', 'review', 'ready'];
const TEAM_MEMBERS = ['@Joswill', '@Maria', '@Carlos', '@Ana'];

export const IdeaDetailModal: React.FC<Props> = ({ visible, onClose, ideaId }) => {
  const { ideas, events, updateIdea, deleteIdea } = useData();
  const idea = ideas.find((i) => i.id === ideaId);

  // States
  const [copyText, setCopyText] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  
  // Production Links
  const [linkCapCut, setLinkCapCut] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [linkAudio, setLinkAudio] = useState('');

  useEffect(() => {
    if (idea) {
      setCopyText(idea.copyText || '');
      setScriptText(idea.scriptText || '');
      setLinkCapCut(idea.productionLinks?.capcut || '');
      setLinkDrive(idea.productionLinks?.drive || '');
      setLinkAudio(idea.productionLinks?.audio || '');
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

  const saveTextsAndLinks = () => {
    updateIdea(idea.id, {
      copyText,
      scriptText,
      productionLinks: {
        capcut: linkCapCut,
        drive: linkDrive,
        audio: linkAudio,
      },
    });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(copyText);
    Alert.alert('¡Copiado!', 'El copy se ha copiado al portapapeles.');
  };

  const openLink = async (url: string) => {
    if (!url || !url.trim()) {
      Alert.alert('Link vacío', 'Debes ingresar un enlace primero.');
      return;
    }
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No se puede abrir este enlace. Verifica que la URL sea válida.');
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const currentChecklist = idea.checklist || [];
    const newItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistItem.trim(),
      completed: false,
    };
    updateIdea(idea.id, { checklist: [...currentChecklist, newItem] });
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (id: string) => {
    const currentChecklist = idea.checklist || [];
    const updated = currentChecklist.map((c) =>
      c.id === id ? { ...c, completed: !c.completed } : c
    );
    updateIdea(idea.id, { checklist: updated });
  };

  const handleDeleteChecklist = (id: string) => {
    const currentChecklist = idea.checklist || [];
    updateIdea(idea.id, { checklist: currentChecklist.filter(c => c.id !== id) });
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

  // Checklist Progress
  const totalTasks = idea.checklist?.length || 0;
  const completedTasks = idea.checklist?.filter((c) => c.completed).length || 0;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ficha Técnica de Producción</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.ideaText}>{idea.text}</Text>

          {/* Event Badge */}
          {event && (
            <View style={styles.eventBadge}>
              <Ionicons name={event.icon as any} size={16} color={colors.accentLight} />
              <Text style={styles.eventBadgeText}>{event.title}</Text>
            </View>
          )}

          {/* Pipeline */}
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

          {/* Asignación y Fecha */}
          <View style={styles.rowSection}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Fecha Programada</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} />
                <Text style={styles.dateText}>
                  {idea.scheduledDate
                    ? idea.scheduledDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                    : 'Sin fecha'}
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
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Responsable</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {TEAM_MEMBERS.map((member) => (
                  <TouchableOpacity
                    key={member}
                    style={[
                      styles.memberBadge,
                      idea.assignedTo === member && styles.memberBadgeActive
                    ]}
                    onPress={() => updateIdea(idea.id, { assignedTo: member })}
                  >
                    <Text style={[styles.memberText, idea.assignedTo === member && styles.memberTextActive]}>
                      {member}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Checklist */}
          <View style={styles.section}>
            <View style={styles.progressRow}>
              <Text style={styles.sectionTitle}>Checklist de Producción</Text>
              <Text style={styles.progressCounter}>{completedTasks}/{totalTasks}</Text>
            </View>
            
            {totalTasks > 0 && (
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
            )}

            <View style={styles.checklistContainer}>
              {idea.checklist?.map((item) => (
                <View key={item.id} style={styles.checklistItem}>
                  <TouchableOpacity onPress={() => toggleChecklistItem(item.id)} style={styles.checkIcon}>
                    <Ionicons 
                      name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={item.completed ? colors.success : colors.textMuted} 
                    />
                  </TouchableOpacity>
                  <Text style={[styles.checklistText, item.completed && styles.checklistTextDone]}>
                    {item.text}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteChecklist(item.id)}>
                    <Ionicons name="close" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.addChecklistRow}>
                <TextInput
                  style={styles.addChecklistInput}
                  placeholder="Ej: Grabar voz en off..."
                  placeholderTextColor={colors.textMuted}
                  value={newChecklistItem}
                  onChangeText={setNewChecklistItem}
                  onSubmitEditing={addChecklistItem}
                />
                <TouchableOpacity style={styles.addChecklistBtn} onPress={addChecklistItem}>
                  <Ionicons name="add" size={20} color={colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Production Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Links de Edición</Text>
            <View style={styles.linksContainer}>
              
              <View style={styles.linkRow}>
                <Ionicons name="cut-outline" size={20} color={colors.textPrimary} />
                <TextInput
                  style={styles.linkInput}
                  placeholder="Link de CapCut / Premiere"
                  placeholderTextColor={colors.textMuted}
                  value={linkCapCut}
                  onChangeText={setLinkCapCut}
                  onBlur={saveTextsAndLinks}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => openLink(linkCapCut)}>
                  <Ionicons name="open-outline" size={20} color={colors.accentLight} />
                </TouchableOpacity>
              </View>

              <View style={styles.linkRow}>
                <Ionicons name="folder-outline" size={20} color={colors.textPrimary} />
                <TextInput
                  style={styles.linkInput}
                  placeholder="Link de Materiales (Drive)"
                  placeholderTextColor={colors.textMuted}
                  value={linkDrive}
                  onChangeText={setLinkDrive}
                  onBlur={saveTextsAndLinks}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => openLink(linkDrive)}>
                  <Ionicons name="open-outline" size={20} color={colors.accentLight} />
                </TouchableOpacity>
              </View>

              <View style={styles.linkRow}>
                <Ionicons name="musical-notes-outline" size={20} color={colors.textPrimary} />
                <TextInput
                  style={styles.linkInput}
                  placeholder="Link de Audio (TikTok/IG)"
                  placeholderTextColor={colors.textMuted}
                  value={linkAudio}
                  onChangeText={setLinkAudio}
                  onBlur={saveTextsAndLinks}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => openLink(linkAudio)}>
                  <Ionicons name="open-outline" size={20} color={colors.accentLight} />
                </TouchableOpacity>
              </View>

            </View>
          </View>

          {/* Guión y Copy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guión / Storyboard</Text>
            <TextInput
              style={styles.textArea}
              multiline
              value={scriptText}
              onChangeText={setScriptText}
              placeholder="Escribe aquí el guión técnico o los pasos del video..."
              placeholderTextColor={colors.textMuted}
              onBlur={saveTextsAndLinks}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color={colors.accentLight} />
              <Text style={styles.sectionTitle}>IA & Copy Final</Text>
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
                style={styles.textArea}
                multiline
                value={copyText}
                onChangeText={setCopyText}
                placeholder="Escribe el copy final aquí..."
                placeholderTextColor={colors.textMuted}
                onBlur={saveTextsAndLinks}
              />
              <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                <Ionicons name="copy-outline" size={20} color={colors.background} />
                <Text style={styles.copyButtonText}>Copiar Copy al Portapapeles</Text>
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
    fontSize: fontSize.md,
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
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 28,
    marginBottom: spacing.sm,
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
  rowSection: {
    flexDirection: 'row',
    gap: spacing.lg,
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
    gap: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  memberBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  memberBadgeActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  memberText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  memberTextActive: {
    color: colors.accentLight,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressCounter: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  checklistContainer: {
    gap: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  checkIcon: {
    padding: 2,
  },
  checklistText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  checklistTextDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addChecklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addChecklistInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    color: colors.textPrimary,
  },
  addChecklistBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linksContainer: {
    gap: spacing.md,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  linkInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.sm,
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
  textArea: {
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
