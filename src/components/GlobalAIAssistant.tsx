import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { chatWithGemini, ChatMessage, AssistantAction } from '../services/gemini';
import { useData } from '../context/DataContext';

export const GlobalAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'model',
    parts: [{ text: '¡Hola! Soy tu Co-Director Creativo. ¿En qué idea trabajamos hoy?' }]
  }]);
  const [loading, setLoading] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const { addIdea } = useData();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [isOpen, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userText = input.trim();
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: userText }] };
    
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setLoading(true);
    Keyboard.dismiss();
    
    try {
      const response = await chatWithGemini(currentMessages);
      
      const assistantMessage: ChatMessage = { role: 'model', parts: [{ text: response.text }] };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Execute action if present
      if (response.action) {
        handleAssistantAction(response.action);
      }
      
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: 'Lo siento, hubo un error al procesar tu solicitud.' }] };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssistantAction = (action: AssistantAction) => {
    if (action.type === 'CREATE_IDEA') {
      addIdea({
        text: action.payload.text || 'Nueva Idea Generada',
        channels: action.payload.channels || [],
        useAI: true,
      });
      
      const successMessage: ChatMessage = { role: 'model', parts: [{ text: '✨ **¡Idea guardada exitosamente en tu tablero!**' }] };
      setMessages((prev) => [...prev, successMessage]);
    }
  };

  return (
    <>
      {/* Botón Flotante (FAB) global */}
      {!isOpen && (
        <TouchableOpacity style={styles.fab} onPress={() => setIsOpen(true)}>
          <Ionicons name="sparkles" size={24} color={colors.background} />
        </TouchableOpacity>
      )}

      {/* Modal de Chat */}
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          
          {/* Fondo opaco para cerrar al tocar fuera */}
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop]} entering={FadeIn} exiting={FadeOut} />
          </TouchableWithoutFeedback>
          
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            {/* Panel Deslizable */}
            <View style={styles.bottomSheet}>
              
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  <Ionicons name="sparkles" size={20} color={colors.accent} />
                  <Text style={styles.headerTitle}>Co-Director IA</Text>
                </View>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <View key={index} style={[styles.messageBubble, isUser ? styles.userBubble : styles.modelBubble]}>
                      {isUser ? (
                        <Text style={styles.userText}>{msg.parts[0].text}</Text>
                      ) : (
                        <Markdown style={markdownStyles}>
                          {msg.parts[0].text}
                        </Markdown>
                      )}
                    </View>
                  );
                })}
                {loading && (
                  <View style={[styles.messageBubble, styles.modelBubble, { alignSelf: 'flex-start' }]}>
                    <ActivityIndicator color={colors.accent} size="small" />
                  </View>
                )}
              </ScrollView>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Dame ideas para TikTok..."
                  placeholderTextColor={colors.textMuted}
                  value={input}
                  onChangeText={setInput}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
                  onPress={handleSend}
                  disabled={!input.trim() || loading}
                >
                  <Ionicons name="send" size={18} color={input.trim() ? colors.background : colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  strong: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  em: {
    fontStyle: 'italic',
  },
  list_item: {
    marginBottom: 4,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 92, // moved up to avoid clashing with the main FAB
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: colors.overlay,
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.accent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    backgroundColor: colors.surfaceBright,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userText: {
    color: colors.background,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceBright,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    color: colors.textPrimary,
    minHeight: 40,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceBright,
  },
});
