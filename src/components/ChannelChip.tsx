import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChannelConfig } from '../constants/channels';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  config: ChannelConfig;
  selected: boolean;
  onToggle: () => void;
}

export const ChannelChip: React.FC<Props> = ({ config, selected, onToggle }) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: config.color + '25', borderColor: config.color }
          : { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <Ionicons
        name={config.icon as any}
        size={16}
        color={selected ? config.color : colors.textMuted}
      />
      <Text
        style={[
          styles.label,
          { color: selected ? config.color : colors.textMuted },
        ]}
      >
        {config.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    gap: 6,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
