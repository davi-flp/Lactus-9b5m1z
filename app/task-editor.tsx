import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useAlert } from '@/template';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ChecklistItem } from '../services/tasksService';
import { TASK_STATUS, TASK_PRIORITY, TaskStatus, TaskPriority } from '../constants/config';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../constants/theme';

const generateId = () => `chk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

const STATUS_OPTIONS: { label: string; value: TaskStatus; color: string }[] = [
  { label: 'Pendente', value: 'pending', color: Colors.statusPending },
  { label: 'Em Progresso', value: 'in_progress', color: Colors.statusProgress },
  { label: 'Concluída', value: 'done', color: Colors.statusDone },
];

const PRIORITY_OPTIONS: { label: string; value: TaskPriority; color: string }[] = [
  { label: 'Baixa', value: 'low', color: Colors.priorityLow },
  { label: 'Média', value: 'medium', color: Colors.priorityMedium },
  { label: 'Alta', value: 'high', color: Colors.priorityHigh },
];

export default function TaskEditorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const { projects } = useProjects();
  const { showAlert } = useAlert();

  const existing = id ? tasks.find(t => t.id === id) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [status, setStatus] = useState<TaskStatus>(existing?.status || 'pending');
  const [priority, setPriority] = useState<TaskPriority>(existing?.priority || 'medium');
  const [dueDate, setDueDate] = useState(existing?.dueDate || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(existing?.checklist || []);
  const [projectId, setProjectId] = useState<string | null>(existing?.projectId || null);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [saving, setSaving] = useState(false);

  const addChecklistItem = useCallback(() => {
    if (!newCheckItem.trim()) return;
    setChecklist(prev => [...prev, { id: generateId(), text: newCheckItem.trim(), done: false }]);
    setNewCheckItem('');
  }, [newCheckItem]);

  const toggleCheckItem = useCallback((itemId: string) => {
    setChecklist(prev => prev.map(i => i.id === itemId ? { ...i, done: !i.done } : i));
  }, []);

  const removeCheckItem = useCallback((itemId: string) => {
    setChecklist(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    const data = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || null,
      checklist,
      projectId,
    };
    if (existing) {
      await updateTask(existing.id, data);
    } else {
      await createTask(data);
    }
    setSaving(false);
    router.back();
  }, [title, description, status, priority, dueDate, checklist, projectId, existing, createTask, updateTask, router]);

  const handleDelete = useCallback(() => {
    if (!existing) return;
    showAlert('Excluir tarefa', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => {
        deleteTask(existing.id);
        router.back();
      }},
    ]);
  }, [existing, showAlert, deleteTask, router]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>{existing ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>
          <View style={styles.headerActions}>
            {existing ? (
              <Pressable onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="delete-outline" size={22} color={Colors.danger} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Input
            label="Título *"
            value={title}
            onChangeText={setTitle}
            placeholder="O que precisa ser feito?"
            autoFocus={!existing}
            containerStyle={{ marginBottom: Spacing.md }}
          />

          {/* Description */}
          <Input
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Detalhes opcionais..."
            multiline
            numberOfLines={3}
            containerStyle={{ marginBottom: Spacing.lg }}
            style={{ minHeight: 70, textAlignVertical: 'top', paddingTop: Spacing.sm }}
          />

          {/* Status */}
          <Text style={styles.groupLabel}>Status</Text>
          <View style={styles.optionsRow}>
            {STATUS_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={[styles.optionChip, status === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '22' }]}
                onPress={() => setStatus(opt.value)}
              >
                <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.optionText, status === opt.value && { color: opt.color }]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Priority */}
          <Text style={styles.groupLabel}>Prioridade</Text>
          <View style={styles.optionsRow}>
            {PRIORITY_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={[styles.optionChip, priority === opt.value && { borderColor: opt.color, backgroundColor: opt.color + '22' }]}
                onPress={() => setPriority(opt.value)}
              >
                <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.optionText, priority === opt.value && { color: opt.color }]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Due Date */}
          <Input
            label="Data Limite (AAAA-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="Ex: 2026-03-20"
            keyboardType="default"
            containerStyle={{ marginBottom: Spacing.lg }}
          />

          {/* Project */}
          {projects.length > 0 ? (
            <>
              <Text style={styles.groupLabel}>Projeto</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectScroll}>
                <Pressable
                  style={[styles.projectChip, projectId === null && styles.projectChipActive]}
                  onPress={() => setProjectId(null)}
                >
                  <Text style={[styles.projectChipText, projectId === null && { color: Colors.brandLight }]}>Nenhum</Text>
                </Pressable>
                {projects.map(p => (
                  <Pressable
                    key={p.id}
                    style={[styles.projectChip, projectId === p.id && { borderColor: p.color, backgroundColor: p.color + '22' }]}
                    onPress={() => setProjectId(projectId === p.id ? null : p.id)}
                  >
                    <Text style={[styles.projectChipText, projectId === p.id && { color: p.color }]}>{p.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}

          {/* Checklist */}
          <Text style={styles.groupLabel}>Checklist</Text>
          {checklist.map(item => (
            <View key={item.id} style={styles.checkItem}>
              <Pressable onPress={() => toggleCheckItem(item.id)} style={styles.checkBox}>
                <View style={[styles.checkCircle, item.done && styles.checkCircleDone]}>
                  {item.done ? <MaterialIcons name="check" size={12} color={Colors.white} /> : null}
                </View>
              </Pressable>
              <Text style={[styles.checkText, item.done && styles.checkTextDone]} numberOfLines={1}>{item.text}</Text>
              <Pressable onPress={() => removeCheckItem(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={16} color={Colors.textMuted} />
              </Pressable>
            </View>
          ))}
          <View style={styles.checkInput}>
            <MaterialIcons name="add" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.checkTextInput}
              value={newCheckItem}
              onChangeText={setNewCheckItem}
              placeholder="Adicionar item..."
              placeholderTextColor={Colors.textMuted}
              onSubmitEditing={addChecklistItem}
              returnKeyType="done"
              blurOnSubmit={false}
              selectionColor={Colors.brand}
            />
            {newCheckItem.trim() ? (
              <Pressable onPress={addChecklistItem}>
                <MaterialIcons name="keyboard-return" size={18} color={Colors.brandLight} />
              </Pressable>
            ) : null}
          </View>

          {/* Save */}
          <View style={styles.saveArea}>
            <Button
              label={saving ? 'Salvando...' : existing ? 'Atualizar Tarefa' : 'Criar Tarefa'}
              onPress={handleSave}
              loading={saving}
              disabled={!title.trim()}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginLeft: Spacing.md },
  headerActions: { flexDirection: 'row', gap: Spacing.md },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  groupLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm },
  optionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionDot: { width: 8, height: 8, borderRadius: 4 },
  optionText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  projectScroll: { gap: Spacing.sm, marginBottom: Spacing.lg },
  projectChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  projectChipActive: { borderColor: Colors.brand, backgroundColor: Colors.brandSurface },
  projectChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  checkBox: { padding: 2 },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  checkText: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  checkTextDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  checkInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xl,
    borderStyle: 'dashed',
  },
  checkTextInput: { flex: 1, color: Colors.text, fontSize: FontSize.sm },
  saveArea: { marginTop: Spacing.sm },
});
