import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Channel } from '../types';
import { getChannelConfig } from '../constants/channels';
import { spacing, borderRadius, fontSize } from '../constants/theme';

interface Props {
  channel: Channel;
}

export const ChannelBadge: React.FC<Props> = ({ channel }) => {
  const config = getChannelConfig(channel);

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  icon: {
    fontSize: 10,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
