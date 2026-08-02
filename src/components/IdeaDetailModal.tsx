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
  Switch,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInUp, SlideOutDown, SlideInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Idea, IdeaStatus, STATUS_CONFIG, ContentPillar } from '../types';
import { PILLARS_CONFIG } from '../constants/pillars';
import { useData } from '../context/DataContext';
import { polishIdeaWithGemini, PolishFocus } from '../services/gemini';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { 
  triggerLightHaptic, 
  triggerSelectionHaptic, 
  triggerSuccessHaptic, 
  triggerHeavyHaptic 
} from '../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  ideaId: string | null;
}

const PIPELINE_STATUSES: IdeaStatus[] = ['idea', 'script', 'editing', 'review', 'ready'];
const REVIEW_STATUSES = ['evaluacion', 'ajustes', 'aprobada', 'archivada'] as const;
const PRIORITIES = ['alta', 'media', 'baja'] as const;
const COMPLEXITIES = ['rapida', 'media', 'compleja'] as const;

export const IdeaDetailModal: React.FC<Props> = ({ visible, onClose, ideaId }) => {
  const { ideas, events, teamMembers, updateIdea, deleteIdea } = useData();
  const idea = ideas.find((i) => i.id === ideaId);

  // States
  const [copyText, setCopyText] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  
  // Production Links
  const [linkCapCut, setLinkCapCut] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [linkAudio, setLinkAudio] = useState('');

  // Meeting Notes
  const [meetingNotes, setMeetingNotes] = useState('');

  // Tabs State
  const [activeTab, setActiveTab] = useState<'info' | 'produccion' | 'copy'>('info');

  useEffect(() => {
    if (idea) {
      setCopyText(idea.copyText || '');
      setScriptText(idea.scriptText || '');
      setLinkCapCut(idea.productionLinks?.capcut || '');
      setLinkDrive(idea.productionLinks?.drive || '');
      setLinkAudio(idea.productionLinks?.audio || '');
      setMeetingNotes(idea.meetingNotes || '');
    }
  }, [idea]);

  if (!idea) return null;

  const event = events.find((e) => e.id === idea.eventId);

  const handleStatusChange = (status: IdeaStatus) => {
    triggerSelectionHaptic();
    updateIdea(idea.id, { status });
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'ios') {
      setShowDatePicker(false);
    }
    if (date) {
      updateIdea(idea.id, { scheduledDate: date });
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: idea.scheduledDate || new Date(),
        mode: 'date',
        onChange: handleDateChange,
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const handlePolishIdea = async (focus: PolishFocus = 'default') => {
    setIsPolishing(true);
    try {
      const aiData = await polishIdeaWithGemini(idea.text, focus);
      updateIdea(idea.id, { aiPolishData: aiData });
      triggerSuccessHaptic();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al pulir la idea con el Asistente. Revisa tu API Key o conexión.');
    } finally {
      setIsPolishing(false);
    }
  };

  const saveTextsAndLinks = () => {
    updateIdea(idea.id, {
      copyText,
      scriptText,
      meetingNotes,
      productionLinks: {
        capcut: linkCapCut,
        drive: linkDrive,
        audio: linkAudio,
      },
    });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(copyText);
    triggerSuccessHaptic();
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
    triggerSelectionHaptic();
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
    const updated = currentChecklist.map((c) => {
      if (c.id === id) {
        if (!c.completed) triggerSuccessHaptic();
        else triggerLightHaptic();
        return { ...c, completed: !c.completed };
      }
      return c;
    });
    updateIdea(idea.id, { checklist: updated });
  };

  const handleDeleteChecklist = (id: string) => {
    triggerLightHaptic();
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
          triggerHeavyHaptic();
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
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#09090B' }]} />
        </TouchableWithoutFeedback>
        <Animated.View style={styles.modalOverlay} entering={SlideInDown.springify()} exiting={SlideOutDown.springify()}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ficha Técnica</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'info' && styles.tabButtonActive]} onPress={() => { triggerSelectionHaptic(); setActiveTab('info'); }}>
            <Ionicons name="information-circle-outline" size={16} color={activeTab === 'info' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>Info</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'produccion' && styles.tabButtonActive]} onPress={() => { triggerSelectionHaptic(); setActiveTab('produccion'); }}>
            <Ionicons name="videocam-outline" size={16} color={activeTab === 'produccion' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'produccion' && styles.tabTextActive]}>Producción</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'copy' && styles.tabButtonActive]} onPress={() => { triggerSelectionHaptic(); setActiveTab('copy'); }}>
            <Ionicons name="document-text-outline" size={16} color={activeTab === 'copy' ? colors.accent : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'copy' && styles.tabTextActive]}>Copy</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {activeTab === 'info' && (
            <>
              <Text style={styles.ideaText}>{idea.text}</Text>

          {/* Event Badge */}
          {event && (
            <View style={styles.eventBadge}>
              <Ionicons name={event.icon as any} size={16} color={colors.accentLight} />
              <Text style={styles.eventBadgeText}>{event.title}</Text>
            </View>
          )}

          {/* Pillar Badge / Selector */}
          <View style={[styles.section, { marginTop: spacing.md }]}>
            <Text style={styles.sectionTitle}>Pilar Estratégico</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 28, gap: 8 }}>
              {(Object.entries(PILLARS_CONFIG) as [ContentPillar, typeof PILLARS_CONFIG[ContentPillar]][]).map(([key, config]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.memberBadge,
                    idea.pillar === key && { backgroundColor: config.color + '25', borderColor: config.color },
                  ]}
                  onPress={() => { triggerSelectionHaptic(); updateIdea(idea.id, { pillar: idea.pillar === key ? undefined : key }); }}
                >
                  <Ionicons 
                    name={config.icon as any} 
                    size={14} 
                    color={idea.pillar === key ? config.color : colors.textSecondary} 
                    style={{ marginRight: 4 }} 
                  />
                  <Text style={[styles.memberText, idea.pillar === key && { color: config.color }]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {idea.status === 'banco' ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Revisión Editorial</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 28, gap: 8 }}>
                {REVIEW_STATUSES.map((status) => {
                  const isActive = idea.reviewStatus === status;
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.pipelineChip,
                        isActive && { backgroundColor: colors.accent, borderColor: colors.accent },
                      ]}
                      onPress={() => { triggerSelectionHaptic(); updateIdea(idea.id, { reviewStatus: status }); }}
                    >
                      <Ionicons
                        name={status === 'evaluacion' ? 'search-outline' : status === 'ajustes' ? 'construct-outline' : status === 'aprobada' ? 'checkmark-circle-outline' : 'archive-outline'}
                        size={16}
                        color={isActive ? colors.background : colors.textPrimary}
                      />
                      <Text style={[styles.pipelineText, isActive && { color: colors.background }]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.rowSection}>
                <View style={[styles.section, { flex: 1 }]}>
                  <Text style={styles.sectionTitle}>Prioridad</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 28, gap: 8 }}>
                    {PRIORITIES.map((pri) => (
                      <TouchableOpacity
                        key={pri}
                        style={[styles.memberBadge, idea.priority === pri && styles.memberBadgeActive]}
                        onPress={() => { triggerSelectionHaptic(); updateIdea(idea.id, { priority: pri }); }}
                      >
                        <Ionicons name="flash-outline" size={14} color={idea.priority === pri ? colors.accentLight : colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.memberText, idea.priority === pri && styles.memberTextActive]}>{pri}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={[styles.section, { flex: 1 }]}>
                  <Text style={styles.sectionTitle}>Dificultad</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 28, gap: 8 }}>
                    {COMPLEXITIES.map((comp) => (
                      <TouchableOpacity
                        key={comp}
                        style={[styles.memberBadge, idea.complexity === comp && styles.memberBadgeActive]}
                        onPress={() => { triggerSelectionHaptic(); updateIdea(idea.id, { complexity: comp }); }}
                      >
                        <Ionicons name={comp === 'rapida' ? 'time-outline' : comp === 'media' ? 'construct-outline' : 'alert-circle-outline'} size={14} color={idea.complexity === comp ? colors.accentLight : colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.memberText, idea.complexity === comp && styles.memberTextActive]}>{comp}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Notas de la Reunión</Text>
              <TextInput
                style={styles.textArea}
                multiline
                value={meetingNotes}
                onChangeText={setMeetingNotes}
                placeholder="Anotaciones de la junta editorial..."
                placeholderTextColor={colors.textMuted}
                onBlur={saveTextsAndLinks}
              />

              <TouchableOpacity 
                style={styles.approveButton}
                onPress={() => { triggerSuccessHaptic(); updateIdea(idea.id, { status: 'idea' }); }}
              >
                <Ionicons name="rocket-outline" size={24} color={colors.background} />
                <Text style={styles.approveButtonText}>Aprobar e Iniciar Producción</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estado (Pipeline)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 28, gap: 8 }}>
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
          )}

          {/* Asignación y Fecha */}
          <View style={styles.rowSection}>
            <View style={[styles.section, { flex: 1.5 }]}>
              <Text style={styles.sectionTitle}>Fecha Programada</Text>
              <View style={styles.datePickerContainer}>
                <TouchableOpacity style={styles.datePickerButton} onPress={openDatePicker}>
                  <Ionicons name="calendar-outline" size={20} color={colors.textPrimary} />
                  <Text style={styles.dateText}>
                    {idea.scheduledDate
                      ? idea.scheduledDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                      : 'Sin fecha'}
                  </Text>
                </TouchableOpacity>
                
                {idea.scheduledDate && (
                  <View style={styles.notifySwitchContainer}>
                    <Ionicons name="notifications-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.notifySwitchLabel}>-1 hr</Text>
                    <Switch
                      value={!!idea.notifyPrior}
                      onValueChange={(val) => updateIdea(idea.id, { notifyPrior: val })}
                      trackColor={{ false: colors.surfaceBright, true: colors.accentLight }}
                      thumbColor={idea.notifyPrior ? colors.accent : colors.textMuted}
                      style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                    />
                  </View>
                )}
              </View>

              {showDatePicker && Platform.OS === 'ios' && (
                <DateTimePicker
                  value={idea.scheduledDate || new Date()}
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Responsable</Text>
              <View style={[styles.datePickerButton, { padding: 8 }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 28, gap: 8, flexDirection: 'row', alignItems: 'center' }}>
                  {teamMembers.map((member) => {
                    const displayName = member.name || member.email || 'Desconocido';
                    return (
                      <TouchableOpacity
                        key={member.uid}
                        style={[
                          styles.memberBadge,
                          idea.assignedTo === displayName && styles.memberBadgeActive
                        ]}
                        onPress={() => { triggerSelectionHaptic(); updateIdea(idea.id, { assignedTo: displayName }); }}
                      >
                        {member.photoURL ? (
                          <Image source={{ uri: member.photoURL }} style={styles.memberAvatar} />
                        ) : (
                          <View style={styles.memberAvatarPlaceholder}>
                            <Ionicons name="person" size={14} color={colors.textSecondary} />
                          </View>
                        )}
                        <Text 
                          style={[styles.memberText, idea.assignedTo === displayName && styles.memberTextActive]}
                          numberOfLines={1} 
                          ellipsizeMode="tail"
                        >
                          {displayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>
          </>
          )}

          {activeTab === 'produccion' && (
            <>
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
          </>
          )}

          {activeTab === 'copy' && (
            <>
          <View style={styles.section}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color={colors.accentLight} />
              <Text style={styles.sectionTitle}>IA & Copy Final</Text>
            </View>

            {idea.aiPolishData && idea.aiPolishData.suggestedCaption && (
              <View style={styles.hooksContainer}>
                <Text style={styles.hooksTitle}>Caption Sugerido (IA):</Text>
                <View style={styles.hookItem}>
                  <Text style={styles.hookText}>{idea.aiPolishData.suggestedCaption}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.copyButton, { marginTop: spacing.sm, paddingVertical: spacing.sm }]} 
                  onPress={() => { setCopyText(idea.aiPolishData!.suggestedCaption); triggerSelectionHaptic(); }}
                >
                  <Ionicons name="arrow-down-outline" size={16} color={colors.background} />
                  <Text style={styles.copyButtonText}>Usar este caption</Text>
                </TouchableOpacity>
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
          </>
          )}
        </ScrollView>

        </KeyboardAvoidingView>
      </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: Platform.OS === 'ios' ? 50 : 0,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
    justifyContent: 'center'
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.accent,
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
    paddingVertical: 2,
  },
  pipelineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    paddingLeft: 6,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceBright,
    marginRight: spacing.sm,
  },
  memberBadgeActive: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
    borderWidth: 1,
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
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  memberAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
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
  refineChipText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  approveButtonText: {
    color: colors.background,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  datePickerContainer: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  notifySwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifySwitchLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  aiPolishContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  angleCard: {
    backgroundColor: colors.surfaceBright,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  angleTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  angleNarrative: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  aiFormatContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  aiFormatLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 4,
  },
  aiFormatValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  refineChip: {
    backgroundColor: colors.surfaceBright,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
});
