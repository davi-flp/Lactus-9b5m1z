import React, { memo, useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize, FontWeight } from '../../../constants/theme';
import { CalendarEvent } from '../../../services/calendarService';

interface MiniCalendarProps {
  events: CalendarEvent[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const MiniCalendar = memo(function MiniCalendar({ events, selectedDate, onSelectDate }: MiniCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const calendarDays = useMemo(() => {
    const { year, month } = viewDate;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [viewDate]);

  const eventDates = useMemo(() => {
    const { year, month } = viewDate;
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return new Set(events.filter(e => e.date.startsWith(prefix)).map(e => e.date));
  }, [events, viewDate]);

  const prevMonth = () => {
    setViewDate(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewDate(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const formatDate = (day: number) => {
    const { year, month } = viewDate;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* Month nav */}
      <View style={styles.monthNav}>
        <Pressable onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="chevron-left" size={24} color={Colors.textSecondary} />
        </Pressable>
        <Text style={styles.monthTitle}>
          {MONTHS[viewDate.month]} {viewDate.year}
        </Text>
        <Pressable onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* Day headers */}
      <View style={styles.daysRow}>
        {DAYS.map(d => (
          <Text key={d} style={styles.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, idx) => {
          if (!day) return <View key={`empty-${idx}`} style={styles.cell} />;
          const dateStr = formatDate(day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasEvent = eventDates.has(dateStr);

          return (
            <Pressable
              key={dateStr}
              style={[
                styles.cell,
                isSelected && styles.selectedCell,
                isToday && !isSelected && styles.todayCell,
              ]}
              onPress={() => onSelectDate(dateStr)}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.selectedDayText,
                isToday && !isSelected && styles.todayDayText,
              ]}>
                {day}
              </Text>
              {hasEvent ? <View style={[styles.dot, isSelected && styles.dotSelected]} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  monthTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  daysRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  selectedCell: { backgroundColor: Colors.brand },
  todayCell: { backgroundColor: Colors.brandSurface },
  dayText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  selectedDayText: { color: Colors.white, fontWeight: FontWeight.bold },
  todayDayText: { color: Colors.brandLight, fontWeight: FontWeight.bold },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.brand, marginTop: 1 },
  dotSelected: { backgroundColor: Colors.white },
});
