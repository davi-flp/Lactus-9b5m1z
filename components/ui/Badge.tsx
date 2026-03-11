import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { TaskPriority, TaskStatus } from '../../constants/config';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
}

export const Badge = memo(function Badge({ label, color, bgColor }: BadgeProps) {
  return (
    <View style={[styles.badge, bgColor ? { backgroundColor: bgColor } : {}]}>
      <Text style={[styles.text, color ? { color } : {}]}>{label}</Text>
    </View>
  );
});

export const PriorityBadge = memo(function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = {
    high: { label: 'Alta', color: Colors.priorityHigh, bg: Colors.dangerDim },
    medium: { label: 'Média', color: Colors.priorityMedium, bg: Colors.warningDim },
    low: { label: 'Baixa', color: Colors.priorityLow, bg: Colors.successDim },
  }[priority];

  return <Badge label={config.label} color={config.color} bgColor={config.bg} />;
});

export const StatusBadge = memo(function StatusBadge({ status }: { status: TaskStatus }) {
  const config = {
    pending: { label: 'Pendente', color: Colors.statusPending, bg: '#1F2937' },
    in_progress: { label: 'Em Progresso', color: Colors.statusProgress, bg: Colors.infoDim },
    done: { label: 'Concluída', color: Colors.statusDone, bg: Colors.successDim },
  }[status];

  return <Badge label={config.label} color={config.color} bgColor={config.bg} />;
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
});
