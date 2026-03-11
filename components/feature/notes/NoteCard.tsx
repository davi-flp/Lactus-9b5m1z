import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Note } from '../../../services/notesService';
import { Colors, Radius, Spacing, FontSize, FontWeight, Shadow } from '../../../constants/theme';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onPin: () => void;
  onDelete: () => void;
}

export const NoteCard = memo(function NoteCard({ note, onPress, onPin, onDelete }: NoteCardProps) {
  const preview = note.content.trim().slice(0, 80) + (note.content.length > 80 ? '...' : '');
  const date = new Date(note.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]} onPress={onPress}>
      {/* Top bar */}
      <View style={styles.row}>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>{note.category || 'Geral'}</Text>
        </View>
        <View style={styles.rowIcons}>
          {note.isPrivate ? (
            <MaterialIcons name="lock" size={14} color={Colors.warning} />
          ) : null}
          {note.isPinned ? (
            <MaterialIcons name="push-pin" size={14} color={Colors.brandLight} />
          ) : null}
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>{note.title || 'Sem título'}</Text>

      {/* Preview */}
      {preview ? <Text style={styles.preview} numberOfLines={2}>{preview}</Text> : null}

      {/* Footer */}
      <View style={[styles.row, { marginTop: Spacing.sm }]}>
        <Text style={styles.date}>{date}</Text>
        <View style={styles.actions}>
          <Pressable onPress={onPin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.actionBtn}>
            <MaterialIcons
              name={note.isPinned ? 'push-pin' : 'push-pin'}
              size={16}
              color={note.isPinned ? Colors.brandLight : Colors.textMuted}
            />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.actionBtn}>
            <MaterialIcons name="delete-outline" size={16} color={Colors.textMuted} />
          </Pressable>
        </View>
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  categoryTag: {
    backgroundColor: Colors.brandSurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  categoryText: { fontSize: FontSize.xs, color: Colors.brandLight, fontWeight: FontWeight.medium },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  preview: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  date: { fontSize: FontSize.xs, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: 4 },
});
