import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../../../services/tasksService';
import { PriorityBadge, StatusBadge } from '../../ui/Badge';
import { Colors, Radius, Spacing, FontSize, FontWeight, Shadow } from '../../../constants/theme';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  onToggleDone: () => void;
  onDelete: () => void;
}

export const TaskCard = memo(function TaskCard({ task, onPress, onToggleDone, onDelete }: TaskCardProps) {
  const isDone = task.status === 'done';
  const doneItems = task.checklist.filter(i => i.done).length;
  const totalItems = task.checklist.length;
  const progress = totalItems > 0 ? doneItems / totalItems : 0;

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : null;

  const isOverdue = task.dueDate && !isDone && new Date(task.dueDate) < new Date();

  return (
    <Pressable style={({ pressed }) => [styles.card, isDone && styles.doneBorder, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <View style={styles.row}>
        {/* Checkbox */}
        <Pressable onPress={onToggleDone} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.checkbox}>
          <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
            {isDone ? <MaterialIcons name="check" size={14} color={Colors.white} /> : null}
          </View>
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>{task.title}</Text>
          <View style={styles.metaRow}>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {dueDateStr ? (
              <Text style={[styles.date, isOverdue && styles.dateOverdue]}>
                {isOverdue ? '⚠ ' : ''}{dueDateStr}
              </Text>
            ) : null}
          </View>
          {totalItems > 0 ? (
            <View style={styles.checklistRow}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
              </View>
              <Text style={styles.checklistText}>{doneItems}/{totalItems}</Text>
            </View>
          ) : null}
        </View>

        {/* Delete */}
        <Pressable onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="delete-outline" size={18} color={Colors.textMuted} />
        </Pressable>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  doneBorder: { borderColor: Colors.successDim, opacity: 0.75 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  checkbox: { paddingTop: 2 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  content: { flex: 1, gap: 6 },
  title: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.text },
  titleDone: { color: Colors.textMuted, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap', alignItems: 'center' },
  date: { fontSize: FontSize.xs, color: Colors.textMuted },
  dateOverdue: { color: Colors.danger },
  checklistRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressBg: { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.brand, borderRadius: 2 },
  checklistText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
