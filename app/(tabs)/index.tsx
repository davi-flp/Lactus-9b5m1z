import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotes } from '../../hooks/useNotes';
import { useTasks } from '../../hooks/useTasks';
import { useCalendar } from '../../hooks/useCalendar';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';

const GREETINGS = ['Bom dia', 'Boa tarde', 'Boa noite'];
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return GREETINGS[0];
  if (h < 18) return GREETINGS[1];
  return GREETINGS[2];
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

const MOTIVATIONAL_QUOTES = [
  'A produtividade é fazer bem as coisas certas.',
  'Pequenos passos todos os dias levam a grandes resultados.',
  'Foco no que importa, ignore o resto.',
  'Organize seus pensamentos, organize sua vida.',
  'O sucesso é a soma de pequenos esforços repetidos.',
  'Comece onde você está. Use o que você tem. Faça o que você pode.',
];

function getDailyQuote() {
  const day = new Date().getDate();
  return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
}

// Circular progress component
function CircularProgress({ progress, size = 60, stroke = 5, color = Colors.brand }: {
  progress: number; size?: number; stroke?: number; color?: string;
}) {
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(progress, 0), 1);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: Colors.surface,
        position: 'absolute',
      }} />
      <Text style={{ fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text }}>
        {Math.round(pct * 100)}%
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { events } = useCalendar();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const todayEvents = useMemo(() => events.filter(e => e.date === todayStr).sort((a, b) => a.time.localeCompare(b.time)), [events, todayStr]);
  const todayTasks = useMemo(() => tasks.filter(t => t.dueDate === todayStr || (!t.dueDate && t.status !== 'done')).slice(0, 5), [tasks, todayStr]);
  const recentNotes = useMemo(() => [...notes].filter(n => !n.isPrivate).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3), [notes]);
  const doneTasks = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks]);
  const pendingTasks = useMemo(() => tasks.filter(t => t.status === 'pending').length, [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(t => t.status === 'in_progress').length, [tasks]);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? doneTasks / totalTasks : 0;

  // Week days for mini calendar widget
  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const hasEvents = events.some(e => e.date === dStr);
      const hasTasks = tasks.some(t => t.dueDate === dStr && t.status !== 'done');
      days.push({
        date: d,
        dateStr: dStr,
        isToday: dStr === todayStr,
        hasEvents,
        hasTasks,
        label: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
        num: d.getDate(),
      });
    }
    return days;
  }, [events, tasks, todayStr]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.dateText}>{formatDate(today)}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.searchBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/search')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="search" size={22} color={Colors.textSecondary} />
          </Pressable>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>L</Text>
          </View>
        </View>

        {/* === WIDGET: Progress Ring === */}
        <View style={styles.widgetCard}>
          <View style={styles.widgetRow}>
            <View style={styles.widgetInfo}>
              <Text style={styles.widgetLabel}>PROGRESSO DO DIA</Text>
              <Text style={styles.widgetTitle}>
                {doneTasks}/{totalTasks} tarefas concluídas
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarFill, { width: `${completionRate * 100}%` as any }]} />
              </View>
              <View style={styles.progressPillRow}>
                <View style={styles.progressPill}>
                  <View style={[styles.pillDot, { backgroundColor: Colors.statusDone }]} />
                  <Text style={styles.pillText}>{doneTasks} feitas</Text>
                </View>
                <View style={styles.progressPill}>
                  <View style={[styles.pillDot, { backgroundColor: Colors.statusProgress }]} />
                  <Text style={styles.pillText}>{inProgressTasks} em progresso</Text>
                </View>
                <View style={styles.progressPill}>
                  <View style={[styles.pillDot, { backgroundColor: Colors.statusPending }]} />
                  <Text style={styles.pillText}>{pendingTasks} pendentes</Text>
                </View>
              </View>
            </View>
            <View style={styles.ringContainer}>
              <View style={styles.ringOuter}>
                <View style={[styles.ringInner, { borderColor: Colors.brand }]}>
                  <Text style={styles.ringPct}>{Math.round(completionRate * 100)}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* === WIDGET: Week Overview === */}
        <View style={styles.widgetCard}>
          <Text style={styles.widgetLabelTop}>SEMANA</Text>
          <View style={styles.weekRow}>
            {weekDays.map((day, idx) => (
              <Pressable
                key={idx}
                style={[styles.dayCol, day.isToday && styles.dayColToday]}
                onPress={() => router.push('/(tabs)/calendar')}
              >
                <Text style={[styles.dayLabel, day.isToday && { color: Colors.brandLight }]}>{day.label}</Text>
                <View style={[styles.dayNum, day.isToday && styles.dayNumToday]}>
                  <Text style={[styles.dayNumText, day.isToday && { color: Colors.white }]}>{day.num}</Text>
                </View>
                <View style={styles.dayDots}>
                  {day.hasEvents ? <View style={[styles.dayDot, { backgroundColor: Colors.warning }]} /> : null}
                  {day.hasTasks ? <View style={[styles.dayDot, { backgroundColor: Colors.info }]} /> : null}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* === WIDGET: Quick Stats Grid === */}
        <View style={styles.statsGrid}>
          <Pressable style={[styles.statWidget, styles.statWidgetBrand]} onPress={() => router.push('/(tabs)/tasks')}>
            <MaterialIcons name="check-circle" size={22} color={Colors.brandLight} />
            <Text style={[styles.statWidgetNum, { color: Colors.brandLight }]}>{doneTasks}</Text>
            <Text style={styles.statWidgetLabel}>Concluídas</Text>
          </Pressable>
          <Pressable style={styles.statWidget} onPress={() => router.push('/(tabs)/tasks')}>
            <MaterialIcons name="pending-actions" size={22} color={Colors.warning} />
            <Text style={[styles.statWidgetNum, { color: Colors.warning }]}>{pendingTasks}</Text>
            <Text style={styles.statWidgetLabel}>Pendentes</Text>
          </Pressable>
          <Pressable style={styles.statWidget} onPress={() => router.push('/(tabs)/calendar')}>
            <MaterialIcons name="event" size={22} color={Colors.success} />
            <Text style={[styles.statWidgetNum, { color: Colors.success }]}>{todayEvents.length}</Text>
            <Text style={styles.statWidgetLabel}>Eventos hoje</Text>
          </Pressable>
          <Pressable style={styles.statWidget} onPress={() => router.push('/(tabs)/notes')}>
            <MaterialIcons name="sticky-note-2" size={22} color={Colors.info} />
            <Text style={[styles.statWidgetNum, { color: Colors.info }]}>{notes.filter(n => !n.isPrivate).length}</Text>
            <Text style={styles.statWidgetLabel}>Notas</Text>
          </Pressable>
        </View>

        {/* === WIDGET: Daily Quote === */}
        <View style={[styles.widgetCard, styles.quoteWidget]}>
          <View style={styles.quoteAccent} />
          <View style={styles.quoteContent}>
            <MaterialIcons name="format-quote" size={20} color={Colors.brandLight} />
            <Text style={styles.quoteText}>{getDailyQuote()}</Text>
          </View>
        </View>

        {/* Today Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Eventos de Hoje</Text>
            <Pressable onPress={() => router.push('/(tabs)/calendar')}>
              <Text style={styles.seeAll}>Ver tudo</Text>
            </Pressable>
          </View>
          {todayEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="event-available" size={28} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhum evento hoje</Text>
            </View>
          ) : (
            todayEvents.map(event => (
              <Pressable key={event.id} style={styles.eventCard} onPress={() => router.push('/(tabs)/calendar')}>
                <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* Today Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tarefas</Text>
            <Pressable onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={styles.seeAll}>Ver tudo</Text>
            </Pressable>
          </View>
          {todayTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="check-circle-outline" size={28} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma tarefa pendente</Text>
            </View>
          ) : (
            todayTasks.map(task => (
              <Pressable key={task.id} style={styles.taskCard} onPress={() => router.push('/(tabs)/tasks')}>
                <View style={[styles.taskDot, {
                  backgroundColor: task.status === 'done' ? Colors.success : task.status === 'in_progress' ? Colors.info : Colors.textMuted
                }]} />
                <Text style={[styles.taskTitle, task.status === 'done' && { textDecorationLine: 'line-through', color: Colors.textMuted }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <PriorityBadge priority={task.priority} />
              </Pressable>
            ))
          )}
        </View>

        {/* Recent Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notas Recentes</Text>
            <Pressable onPress={() => router.push('/(tabs)/notes')}>
              <Text style={styles.seeAll}>Ver tudo</Text>
            </Pressable>
          </View>
          {recentNotes.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialIcons name="sticky-note-2" size={28} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma nota criada</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.sm }}>
              {recentNotes.map(note => (
                <Pressable key={note.id} style={styles.noteCard} onPress={() => router.push('/(tabs)/notes')}>
                  <Text style={styles.noteTitle} numberOfLines={1}>{note.title || 'Sem título'}</Text>
                  <Text style={styles.notePreview} numberOfLines={3}>{note.content || 'Vazio'}</Text>
                  <Text style={styles.noteDate}>
                    {new Date(note.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickBtn} onPress={() => router.push('/note-editor')}>
              <MaterialIcons name="add" size={20} color={Colors.brandLight} />
              <Text style={styles.quickBtnText}>Nova Nota</Text>
            </Pressable>
            <Pressable style={styles.quickBtn} onPress={() => router.push('/task-editor')}>
              <MaterialIcons name="add-task" size={20} color={Colors.success} />
              <Text style={styles.quickBtnText}>Nova Tarefa</Text>
            </Pressable>
            <Pressable style={styles.quickBtn} onPress={() => router.push('/event-editor')}>
              <MaterialIcons name="event" size={20} color={Colors.warning} />
              <Text style={styles.quickBtnText}>Novo Evento</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
  },
  greeting: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  dateText: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  brandBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.brand,
  },
  brandText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white },

  // Widget cards
  widgetCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  widgetRow: { flexDirection: 'row', alignItems: 'center' },
  widgetLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  widgetLabelTop: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  widgetTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  widgetInfo: { flex: 1, marginRight: Spacing.md },

  // Progress bar
  progressBarContainer: {
    height: 6,
    backgroundColor: Colors.bgSecondary,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: Colors.brand,
    borderRadius: Radius.full,
  },
  progressPillRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  progressPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: FontSize.xs, color: Colors.textMuted },

  // Ring
  ringContainer: { alignItems: 'center', justifyContent: 'center' },
  ringOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: Colors.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  ringPct: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.brandLight },

  // Week widget
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    flex: 1,
    borderRadius: Radius.sm,
  },
  dayColToday: { backgroundColor: Colors.brandSurface },
  dayLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  dayNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumToday: { backgroundColor: Colors.brand },
  dayNumText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  dayDots: { flexDirection: 'row', gap: 2, height: 6 },
  dayDot: { width: 4, height: 4, borderRadius: 2 },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statWidget: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 3,
  },
  statWidgetBrand: { borderColor: Colors.brand + '55', backgroundColor: Colors.brandSurface },
  statWidgetNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  statWidgetLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },

  // Quote widget
  quoteWidget: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  quoteAccent: { width: 4, backgroundColor: Colors.brand },
  quoteContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  quoteText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Section styles
  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  seeAll: { fontSize: FontSize.sm, color: Colors.brandLight },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventDot: { width: 10, height: 10, borderRadius: 5 },
  eventTitle: { fontSize: FontSize.base, color: Colors.text, fontWeight: FontWeight.medium },
  eventTime: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskTitle: { flex: 1, fontSize: FontSize.base, color: Colors.text },
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    width: 160,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  noteTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  notePreview: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18, flex: 1 },
  noteDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium, textAlign: 'center' },
});
