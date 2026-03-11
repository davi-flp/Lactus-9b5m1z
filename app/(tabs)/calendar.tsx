import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCalendar } from '../../hooks/useCalendar';
import { useAlert } from '@/template';
import { MiniCalendar } from '../../components/feature/calendar/MiniCalendar';
import { CalendarEvent } from '../../services/calendarService';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { events, deleteEvent } = useCalendar();
  const { showAlert } = useAlert();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const dayEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDate]);

  const handleDelete = useCallback((event: CalendarEvent) => {
    showAlert('Excluir evento', `Excluir "${event.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteEvent(event.id) },
    ]);
  }, [showAlert, deleteEvent]);

  const formatSelectedDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calendário</Text>
        </View>

        {/* Calendar */}
        <MiniCalendar
          events={events}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Day Events */}
        <View style={styles.daySection}>
          <View style={styles.daySectionHeader}>
            <Text style={styles.dayTitle} numberOfLines={1}>{formatSelectedDate(selectedDate)}</Text>
            <Pressable
              style={styles.addEventBtn}
              onPress={() => router.push({ pathname: '/event-editor', params: { date: selectedDate } })}
            >
              <MaterialIcons name="add" size={18} color={Colors.white} />
            </Pressable>
          </View>

          {dayEvents.length === 0 ? (
            <View style={styles.emptyDay}>
              <MaterialIcons name="event-available" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyDayText}>Nenhum evento neste dia</Text>
              <Pressable
                style={styles.emptyAddBtn}
                onPress={() => router.push({ pathname: '/event-editor', params: { date: selectedDate } })}
              >
                <Text style={styles.emptyAddText}>Adicionar evento</Text>
              </Pressable>
            </View>
          ) : (
            dayEvents.map(event => (
              <Pressable
                key={event.id}
                style={({ pressed }) => [styles.eventCard, pressed && { opacity: 0.85 }]}
                onPress={() => router.push({ pathname: '/event-editor', params: { id: event.id } })}
              >
                <View style={[styles.eventAccent, { backgroundColor: event.color }]} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.description ? (
                    <Text style={styles.eventDesc} numberOfLines={1}>{event.description}</Text>
                  ) : null}
                  <View style={styles.eventMeta}>
                    <MaterialIcons name="access-time" size={12} color={Colors.textMuted} />
                    <Text style={styles.eventTime}>{event.time || 'Sem hora'}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleDelete(event)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="delete-outline" size={18} color={Colors.textMuted} />
                </Pressable>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] }, Shadow.brand]}
        onPress={() => router.push({ pathname: '/event-editor', params: { date: selectedDate } })}
      >
        <MaterialIcons name="add" size={28} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.base, paddingBottom: 100 },
  header: { paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text },
  daySection: { marginTop: Spacing.xl },
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  dayTitle: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text, textTransform: 'capitalize' },
  addEventBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  emptyDay: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyDayText: { fontSize: FontSize.base, color: Colors.textMuted },
  emptyAddBtn: {
    backgroundColor: Colors.brandSurface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  emptyAddText: { color: Colors.brandLight, fontWeight: FontWeight.semibold },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  eventAccent: { width: 4, alignSelf: 'stretch' },
  eventContent: { flex: 1, padding: Spacing.md, gap: 3 },
  eventTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  eventDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventTime: { fontSize: FontSize.xs, color: Colors.textMuted },
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
