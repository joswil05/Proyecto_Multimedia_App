import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="infinite-outline" size={64} color={colors.accent} />
          <Text style={styles.title}>Content OS</Text>
          <Text style={styles.subtitle}>El centro de producción para tu equipo creativo</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
            <Ionicons name="logo-google" size={24} color={colors.background} />
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.appleButton} onPress={signInWithApple}>
              <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
              <Text style={styles.appleButtonText}>Continuar con Apple</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: spacing.lg,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  googleButtonText: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  appleButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});
