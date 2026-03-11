import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTasks } from '../../hooks/useTasks';
import { useAlert } from '@/template';
import { TaskCard } from '../../components/feature/tasks/TaskCard';
import { Task } from '../../services/tasksService';
import { TaskStatus, TaskPriority, TASK_STATUS } from '../../constants/config';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';

const STATUS_FILTERS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendente', value: 'pending' },
  { label: 'Em Progresso', value: 'in_progress' },
  { label: 'Concluída', value: 'done' },
];

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks, deleteTask, updateTask, toggleChecklist } = useTasks();
  const { showAlert } = useAlert();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const filtered = useMemo(() => {
    let result = [...tasks];
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    return result.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, statusFilter]);

  const doneCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);

  const handleDelete = useCallback((task: Task) => {
    showAlert('Excluir tarefa', `Excluir "${task.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteTask(task.id) },
    ]);
  }, [showAlert, deleteTask]);

  const handleToggleDone = useCallback((task: Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    updateTask(task.id, { status: newStatus as TaskStatus });
  }, [updateTask]);

  const handleEdit = useCallback((task: Task) => {
    router.push({ pathname: '/task-editor', params: { id: task.id } });
  }, [router]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tarefas</Text>
          <Text style={styles.subtitle}>{doneCount}/{tasks.length} concluídas</Text>
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>
            {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%
          </Text>
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersOuter}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={item => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => {
            const isActive = statusFilter === item.value;
            return (
              <Pressable
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setStatusFilter(item.value)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{item.label}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Tasks List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="check-circle-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>
              {statusFilter !== 'all' ? 'Nenhuma tarefa neste status' : 'Nenhuma tarefa criada'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleEdit(item)}
            onToggleDone={() => handleToggleDone(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] }, Shadow.brand]}
        onPress={() => router.push('/task-editor')}
      >
        <MaterialIcons name="add" size={28} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  progressCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.brandSurface,
    borderWidth: 2,
    borderColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.brandLight },
  filtersOuter: { height: 50 },
  filtersContent: { paddingHorizontal: Spacing.base, alignItems: 'center', gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: Colors.white },
  listContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxxl, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
