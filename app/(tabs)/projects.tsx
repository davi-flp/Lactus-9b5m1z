import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useAlert } from '@/template';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { KanbanColumn } from '../../components/feature/projects/KanbanColumn';
import { Project } from '../../services/projectsService';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { PROJECT_COLUMNS, ProjectColumn } from '../../constants/config';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { projects, createProject, deleteProject } = useProjects();
  const { tasks, updateTask, createTask } = useTasks();
  const { showAlert } = useAlert();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const projectTasks = useMemo(() => {
    if (!selectedProject) return [];
    return tasks.filter(t => t.projectId === selectedProject.id);
  }, [tasks, selectedProject]);

  const todoTasks = useMemo(() => projectTasks.filter(t => t.status === 'pending'), [projectTasks]);
  const doingTasks = useMemo(() => projectTasks.filter(t => t.status === 'in_progress'), [projectTasks]);
  const doneTasks = useMemo(() => projectTasks.filter(t => t.status === 'done'), [projectTasks]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setSaving(true);
    await createProject({ name: newName.trim(), description: newDesc.trim() });
    setNewName('');
    setNewDesc('');
    setSaving(false);
    setShowCreate(false);
  }, [createProject, newName, newDesc]);

  const handleDelete = useCallback((project: Project) => {
    showAlert('Excluir projeto', `Excluir "${project.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => {
        if (selectedProject?.id === project.id) setSelectedProject(null);
        deleteProject(project.id);
      }},
    ]);
  }, [showAlert, deleteProject, selectedProject]);

  const handleAddTask = useCallback(async (column: ProjectColumn) => {
    if (!selectedProject) return;
    const statusMap = { todo: 'pending', doing: 'in_progress', done: 'done' } as const;
    await createTask({
      title: 'Nova tarefa',
      description: '',
      status: statusMap[column],
      priority: 'medium',
      dueDate: null,
      checklist: [],
      projectId: selectedProject.id,
    });
  }, [createTask, selectedProject]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Projetos</Text>
        <Pressable style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <MaterialIcons name="add" size={22} color={Colors.white} />
        </Pressable>
      </View>

      {/* Project List */}
      {projects.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="folder-open" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum projeto</Text>
          <Text style={styles.emptySubtitle}>Crie seu primeiro projeto para organizar tarefas</Text>
          <Pressable style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
            <Text style={styles.emptyBtnText}>Criar Projeto</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* Project Selector */}
          <View style={styles.projectListOuter}>
            <FlatList
              horizontal
              data={projects}
              keyExtractor={p => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.projectListContent}
              renderItem={({ item }) => {
                const isSelected = selectedProject?.id === item.id;
                const pTasks = tasks.filter(t => t.projectId === item.id);
                const donePTasks = pTasks.filter(t => t.status === 'done').length;
                return (
                  <Pressable
                    style={[styles.projectCard, isSelected && { borderColor: item.color, borderWidth: 2 }]}
                    onPress={() => setSelectedProject(isSelected ? null : item)}
                    onLongPress={() => handleDelete(item)}
                  >
                    <View style={[styles.projectIcon, { backgroundColor: item.color + '33' }]}>
                      <MaterialIcons name="folder" size={22} color={item.color} />
                    </View>
                    <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.projectMeta}>{donePTasks}/{pTasks.length} tarefas</Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Kanban */}
          {selectedProject ? (
            <View style={styles.kanbanArea}>
              <View style={styles.kanbanHeader}>
                <Text style={styles.kanbanTitle}>{selectedProject.name}</Text>
                <Text style={styles.kanbanSubtitle}>Toque e segure um projeto para excluir</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.kanbanContent}
              >
                <KanbanColumn
                  title="A Fazer"
                  color={Colors.statusPending}
                  tasks={todoTasks}
                  onTaskPress={t => router.push({ pathname: '/task-editor', params: { id: t.id } })}
                  onAddTask={() => handleAddTask(PROJECT_COLUMNS.TODO)}
                />
                <KanbanColumn
                  title="Fazendo"
                  color={Colors.statusProgress}
                  tasks={doingTasks}
                  onTaskPress={t => router.push({ pathname: '/task-editor', params: { id: t.id } })}
                  onAddTask={() => handleAddTask(PROJECT_COLUMNS.DOING)}
                />
                <KanbanColumn
                  title="Feito"
                  color={Colors.statusDone}
                  tasks={doneTasks}
                  onTaskPress={t => router.push({ pathname: '/task-editor', params: { id: t.id } })}
                  onAddTask={() => handleAddTask(PROJECT_COLUMNS.DONE)}
                />
              </ScrollView>
            </View>
          ) : (
            <View style={styles.noSelection}>
              <MaterialIcons name="touch-app" size={32} color={Colors.textMuted} />
              <Text style={styles.noSelectionText}>Selecione um projeto para ver o Kanban</Text>
            </View>
          )}
        </>
      )}

      {/* Create Modal */}
      <Modal visible={showCreate} title="Novo Projeto" onClose={() => setShowCreate(false)}>
        <View style={styles.modalContent}>
          <Input
            label="Nome do Projeto"
            value={newName}
            onChangeText={setNewName}
            placeholder="Ex: App Mobile"
            autoFocus
            containerStyle={{ marginBottom: Spacing.md }}
          />
          <Input
            label="Descrição (opcional)"
            value={newDesc}
            onChangeText={setNewDesc}
            placeholder="Breve descrição..."
            multiline
            numberOfLines={3}
            containerStyle={{ marginBottom: Spacing.xl }}
            style={{ minHeight: 70, textAlignVertical: 'top', paddingTop: Spacing.sm }}
          />
          <Button
            label={saving ? 'Criando...' : 'Criar Projeto'}
            onPress={handleCreate}
            loading={saving}
            disabled={!newName.trim()}
            fullWidth
          />
        </View>
      </Modal>
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
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.brand,
  },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  emptySubtitle: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    backgroundColor: Colors.brand,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    ...Shadow.brand,
  },
  emptyBtnText: { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.base },
  projectListOuter: { height: 110 },
  projectListContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, alignItems: 'center' },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    width: 130,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  projectIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  projectName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  projectMeta: { fontSize: FontSize.xs, color: Colors.textMuted },
  kanbanArea: { flex: 1 },
  kanbanHeader: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm },
  kanbanTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  kanbanSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  kanbanContent: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxl, alignItems: 'flex-start' },
  noSelection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  noSelectionText: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center' },
  modalContent: { paddingTop: Spacing.sm, paddingBottom: Spacing.md },
});
