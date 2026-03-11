import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCalendar } from '../hooks/useCalendar';
import { useAlert } from '@/template';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../constants/theme';

const EVENT_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function EventEditorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, date: dateParam } = useLocalSearchParams<{ id?: string; date?: string }>();
  const { events, createEvent, updateEvent, deleteEvent } = useCalendar();
  const { showAlert } = useAlert();

  const existing = id ? events.find(e => e.id === id) : null;

  const today = new Date();
  const defaultDate = dateParam || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [date, setDate] = useState(existing?.date || defaultDate);
  const [time, setTime] = useState(existing?.time || '09:00');
  const [color, setColor] = useState(existing?.color || EVENT_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    const data = { title: title.trim(), description: description.trim(), date, time, color };
    if (existing) {
      await updateEvent(existing.id, data);
    } else {
      await createEvent(data);
    }
    setSaving(false);
    router.back();
  }, [title, description, date, time, color, existing, createEvent, updateEvent, router]);

  const handleDelete = useCallback(() => {
    if (!existing) return;
    showAlert('Excluir evento', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => {
        deleteEvent(existing.id);
        router.back();
      }},
    ]);
  }, [existing, showAlert, deleteEvent, router]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.headerTitle}>{existing ? 'Editar Evento' : 'Novo Evento'}</Text>
          {existing ? (
            <Pressable onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="delete-outline" size={22} color={Colors.danger} />
            </Pressable>
          ) : <View style={{ width: 24 }} />}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Color accent */}
          <View style={[styles.colorAccent, { backgroundColor: color }]} />

          {/* Title */}
          <Input
            label="Título *"
            value={title}
            onChangeText={setTitle}
            placeholder="Nome do evento"
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

          {/* Date & Time */}
          <View style={styles.row}>
            <Input
              label="Data (AAAA-MM-DD)"
              value={date}
              onChangeText={setDate}
              placeholder="2026-03-15"
              containerStyle={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Input
              label="Hora (HH:MM)"
              value={time}
              onChangeText={setTime}
              placeholder="09:00"
              keyboardType="numbers-and-punctuation"
              containerStyle={{ flex: 1 }}
            />
          </View>

          {/* Color Picker */}
          <Text style={styles.groupLabel}>Cor do Evento</Text>
          <View style={styles.colorRow}>
            {EVENT_COLORS.map(c => (
              <Pressable
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                onPress={() => setColor(c)}
              >
                {color === c ? <MaterialIcons name="check" size={14} color={Colors.white} /> : null}
              </Pressable>
            ))}
          </View>

          {/* Save */}
          <View style={styles.saveArea}>
            <Button
              label={saving ? 'Salvando...' : existing ? 'Atualizar Evento' : 'Criar Evento'}
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
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },
  colorAccent: {
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.lg,
  },
  row: { flexDirection: 'row', marginBottom: Spacing.lg },
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  colorRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: Colors.white,
  },
  saveArea: { marginTop: Spacing.sm },
});
