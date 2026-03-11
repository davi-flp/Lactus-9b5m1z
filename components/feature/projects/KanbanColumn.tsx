import React, { memo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../../../services/tasksService';
import { Colors, Radius, Spacing, FontSize, FontWeight } from '../../../constants/theme';
import { PriorityBadge } from '../../ui/Badge';

interface KanbanColumnProps {
  title: string;
  color: string;
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onAddTask: () => void;
}

export const KanbanColumn = memo(function KanbanColumn({ title, color, tasks, onTaskPress, onAddTask }: KanbanColumnProps) {
  return (
    <View style={styles.column}>
      {/* Header */}
      <View style={styles.colHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.colTitle}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tasks.length}</Text>
        </View>
      </View>

      {/* Tasks */}
      {tasks.map(task => (
        <Pressable
          key={task.id}
          style={({ pressed }) => [styles.taskCard, pressed && { opacity: 0.8 }]}
          onPress={() => onTaskPress(task)}
        >
          <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
          <View style={styles.taskMeta}>
            <PriorityBadge priority={task.priority} />
            {task.checklist.length > 0 ? (
              <Text style={styles.checklistCount}>
                {task.checklist.filter(i => i.done).length}/{task.checklist.length}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ))}

      {/* Add button */}
      <Pressable style={styles.addBtn} onPress={onAddTask}>
        <MaterialIcons name="add" size={16} color={Colors.textMuted} />
        <Text style={styles.addText}>Adicionar</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  column: {
    width: 220,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 200,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  colTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  badge: {
    backgroundColor: Colors.surface,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  taskCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  taskTitle: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium, lineHeight: 18 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  checklistCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  addText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
