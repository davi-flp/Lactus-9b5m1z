import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNotes } from '../hooks/useNotes';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../constants/theme';

const CATEGORIES = ['Geral', 'Trabalho', 'Pessoal', 'Ideias', 'Estudo'];

export default function NoteEditorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, private: privateParam } = useLocalSearchParams<{ id?: string; private?: string }>();
  const { notes, createNote, updateNote } = useNotes();

  const existing = id ? notes.find(n => n.id === id) : null;
  const isPrivateNew = privateParam === '1';

  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [category, setCategory] = useState(existing?.category || 'Geral');
  const [isPinned, setIsPinned] = useState(existing?.isPinned || false);
  const [isPrivate, setIsPrivate] = useState(existing?.isPrivate ?? isPrivateNew);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      router.back();
      return;
    }
    setSaving(true);
    if (existing) {
      await updateNote(existing.id, { title, content, category, isPinned, isPrivate });
    } else {
      await createNote({ title, content, category, isPinned, isPrivate });
    }
    setSaving(false);
    router.back();
  }, [title, content, category, isPinned, isPrivate, existing, createNote, updateNote, router]);

  // Auto-save on unmount for existing notes
  useEffect(() => {
    return () => {
      if (existing && (title.trim() || content.trim()) && !saving) {
        updateNote(existing.id, { title, content, category, isPinned, isPrivate });
      }
    };
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textSecondary} />
          </Pressable>
          <View style={styles.headerActions}>
            {/* Private toggle */}
            <Pressable
              onPress={() => setIsPrivate(!isPrivate)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[styles.headerBtn, isPrivate && styles.headerBtnActive]}
            >
              <MaterialIcons
                name={isPrivate ? 'lock' : 'lock-open'}
                size={20}
                color={isPrivate ? Colors.warning : Colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={() => setIsPinned(!isPinned)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.headerBtn}
            >
              <MaterialIcons
                name="push-pin"
                size={22}
                color={isPinned ? Colors.brandLight : Colors.textMuted}
              />
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Private badge */}
        {isPrivate ? (
          <View style={styles.privateBadge}>
            <MaterialIcons name="lock" size={12} color={Colors.warning} />
            <Text style={styles.privateBadgeText}>Nota privada — protegida por PIN</Text>
          </View>
        ) : null}

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Category Chips */}
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={c => c}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
            style={styles.categoriesList}
            renderItem={({ item }) => {
              const isActive = category === item;
              return (
                <Pressable
                  style={[styles.catChip, isActive && styles.catChipActive]}
                  onPress={() => setCategory(item)}
                >
                  <Text style={[styles.catText, isActive && styles.catTextActive]}>{item}</Text>
                </Pressable>
              );
            }}
          />

          {/* Title */}
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Título..."
            placeholderTextColor={Colors.textMuted}
            multiline
            selectionColor={Colors.brand}
            autoFocus={!existing}
          />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Content */}
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Escreva sua nota aqui..."
            placeholderTextColor={Colors.textMuted}
            multiline
            selectionColor={Colors.brand}
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <Text style={styles.footerText}>
            {content.length} caracteres
            {existing ? ' · Edição' : ' · Nova nota'}
            {isPrivate ? ' · 🔒 Privada' : ''}
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerBtn: { padding: Spacing.xs },
  headerBtnActive: {
    backgroundColor: Colors.warningDim,
    borderRadius: Radius.sm,
  },
  saveBtn: {
    backgroundColor: Colors.brand,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  saveBtnText: { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.warningDim,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '33',
  },
  privateBadgeText: { fontSize: FontSize.xs, color: Colors.warning },
  categoriesList: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  categoriesContent: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.brandSurface, borderColor: Colors.brandLight },
  catText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium },
  catTextActive: { color: Colors.brandLight },
  titleInput: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    lineHeight: 32,
  },
  divider: { height: 1, backgroundColor: Colors.divider, marginHorizontal: Spacing.base },
  contentInput: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    lineHeight: 24,
    minHeight: 300,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  footerText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
