import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PinnedEvent } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { triggerLightHaptic } from '../utils/haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - spacing.xl * 2;

interface Props {
  events: PinnedEvent[];
  onEventPress: (event: PinnedEvent) => void;
  onCreateEvent: () => void;
}

export const EventsCarousel: React.FC<Props> = ({ events, onEventPress, onCreateEvent }) => {
  const data: Array<PinnedEvent | 'create'> = [...events, 'create'];
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const activeIndex = useSharedValue(0);
  
  const SWIPE_THRESHOLD = -CARD_WIDTH * 0.2;

  const handleIndexChange = (index: number) => {
    triggerLightHaptic();
    setCurrentIndex(index);
  };

  const dataLength = data.length;

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      let newIndex = currentIndex - (event.translationX / CARD_WIDTH);
      if (newIndex < 0) newIndex = 0;
      if (newIndex > dataLength - 1) newIndex = dataLength - 1;
      activeIndex.value = newIndex;
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const translation = event.translationX;
      
      let nextIndex = currentIndex;
      if (translation < SWIPE_THRESHOLD || velocity < -500) {
        nextIndex = Math.min(currentIndex + 1, dataLength - 1);
      } else if (translation > -SWIPE_THRESHOLD || velocity > 500) {
        nextIndex = Math.max(currentIndex - 1, 0);
      }

      activeIndex.value = withSpring(nextIndex, { damping: 15 });
      if (nextIndex !== currentIndex) {
        runOnJS(handleIndexChange)(nextIndex);
      }
    });

  const renderItem = (item: PinnedEvent | 'create', index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      const relativeIndex = index - activeIndex.value;

      const scale = interpolate(
        relativeIndex,
        [-1, 0, 1, 2],
        [1, 1, 0.92, 0.84],
        Extrapolation.CLAMP
      );

      const translateY = interpolate(
        relativeIndex,
        [-1, 0, 1, 2],
        [0, 0, 12, 24],
        Extrapolation.CLAMP
      );

      const translateX = interpolate(
        relativeIndex,
        [-1, 0, 1, 2],
        [-CARD_WIDTH - spacing.xl, 0, 0, 0],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        relativeIndex,
        [-1, 0, 1, 2, 3],
        [0, 1, 0.8, 0.5, 0],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          { translateX },
          { translateY },
          { scale },
        ],
        opacity,
        zIndex: dataLength - index,
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
      };
    });

    if (item === 'create') {
      return (
        <Animated.View key="create" style={[animatedStyle]}>
          <TouchableOpacity
            style={[styles.card, styles.createCard, { width: CARD_WIDTH }]}
            onPress={onCreateEvent}
            activeOpacity={1}
          >
            <View style={styles.createIconContainer}>
              <Ionicons name="add" size={24} color={colors.textMuted} />
            </View>
            <Text style={styles.createText}>Crear Evento Especial</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    const event = item as PinnedEvent;
    const progress = Math.min((event.completedContent / event.totalContentGoal) * 100, 100);
    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(event.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    return (
      <Animated.View key={event.id} style={[animatedStyle]}>
        <TouchableOpacity
          style={[styles.card, { width: CARD_WIDTH }]}
          onPress={() => onEventPress(event)}
          activeOpacity={1}
        >
          <LinearGradient
            colors={event.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <View style={styles.iconContainer}>
                <Ionicons name={event.icon as any} size={20} color={colors.textPrimary} />
              </View>
              <View style={styles.daysBadge}>
                <Ionicons name="time-outline" size={14} color={colors.textPrimary} />
                <Text style={styles.daysText}>{daysLeft} días</Text>
              </View>
            </View>
            
            <Text style={styles.title}>{event.title}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  {event.completedContent} / {event.totalContentGoal} listos
                </Text>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.stackContainer}>
          {data.map((item, index) => renderItem(item, index))}
        </View>
      </GestureDetector>
      
      <View style={styles.pagination}>
        {data.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              currentIndex === idx && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  stackContainer: {
    width: CARD_WIDTH,
    height: 140 + 24, // Card height + max translateY
  },
  card: {
    height: 140,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  createCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  createIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  daysText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressContainer: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    opacity: 0.9,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: 2,
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md,
    height: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
    opacity: 0.4,
  },
  dotActive: {
    width: 16,
    opacity: 1,
    backgroundColor: colors.textPrimary,
  },
});
