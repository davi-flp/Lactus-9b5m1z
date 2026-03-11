import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotes } from '../../hooks/useNotes';
import { useAlert } from '@/template';
import { NoteCard } from '../../components/feature/notes/NoteCard';
import { PinModal } from '../../components/ui/PinModal';
import { Note } from '../../services/notesService';
import { Colors, Spacing, FontSize, FontWeight, Radius, Shadow } from '../../constants/theme';

const CATEGORIES = ['Todas', 'Geral', 'Trabalho', 'Pessoal', 'Ideias', 'Estudo'];

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes, deleteNote, togglePin, hasPIN, setupPIN, verifyPIN } = useNotes();
  const { showAlert } = useAlert();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // PIN state
  const [privateUnlocked, setPrivateUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState<'set' | 'verify'>('verify');
  const [showPrivate, setShowPrivate] = useState(false);

  const filtered = useMemo(() => {
    let result = notes.filter(n => showPrivate ? n.isPrivate : !n.isPrivate);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'Todas') {
      result = result.filter(n => n.category === selectedCategory);
    }
    return result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [notes, search, selectedCategory, showPrivate]);

  const privateCount = useMemo(() => notes.filter(n => n.isPrivate).length, [notes]);

  const handleDelete = useCallback((note: Note) => {
    showAlert('Excluir nota', `Tem certeza que deseja excluir "${note.title || 'Sem título'}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteNote(note.id) },
    ]);
  }, [showAlert, deleteNote]);

  const handleEdit = useCallback((note: Note) => {
    router.push({ pathname: '/note-editor', params: { id: note.id } });
  }, [router]);

  const handlePrivateToggle = useCallback(() => {
    if (showPrivate) {
      // Lock private view
      setShowPrivate(false);
      setPrivateUnlocked(false);
    } else {
      if (privateUnlocked) {
        setShowPrivate(true);
      } else if (hasPIN) {
        setPinMode('verify');
        setShowPinModal(true);
      } else {
        setPinMode('set');
        setShowPinModal(true);
      }
    }
  }, [showPrivate, privateUnlocked, hasPIN]);

  const handlePinSuccess = useCallback(async (pin: string) => {
    setShowPinModal(false);
    if (pinMode === 'set') {
      await setupPIN(pin);
      setPrivateUnlocked(true);
      setShowPrivate(true);
    } else {
      const ok = await verifyPIN(pin);
      if (ok) {
        setPrivateUnlocked(true);
        setShowPrivate(true);
      } else {
        setShowPinModal(false);
        showAlert('PIN incorreto', 'O PIN digitado está incorreto. Tente novamente.');
      }
    }
  }, [pinMode, setupPIN, verifyPIN, showAlert]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{showPrivate ? 'Notas Privadas' : 'Notas'}</Text>
          <Text style={styles.count}>{notes.filter(n => !n.isPrivate).length} pública{notes.filter(n => !n.isPrivate).length !== 1 ? 's' : ''} · {privateCount} privada{privateCount !== 1 ? 's' : ''}</Text>
        </View>
        <Pressable
          style={[styles.privateBtn, showPrivate && styles.privateBtnActive]}
          onPress={handlePrivateToggle}
        >
          <MaterialIcons
            name={showPrivate ? 'lock-open' : 'lock'}
            size={18}
            color={showPrivate ? Colors.warning : Colors.textSecondary}
          />
          <Text style={[styles.privateBtnText, showPrivate && { color: Colors.warning }]}>
            {showPrivate ? 'Bloquear' : 'Privadas'}
          </Text>
        </Pressable>
      </View>

      {/* Private banner */}
      {showPrivate ? (
        <View style={styles.privateBanner}>
          <MaterialIcons name="shield" size={14} color={Colors.warning} />
          <Text style={styles.privateBannerText}>Modo privado ativo — toque em "Bloquear" para sair</Text>
        </View>
      ) : null}

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar notas..."
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.brand}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Categories */}
      <View style={styles.categoriesOuter}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <Pressable
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.catText, isActive && styles.catTextActive]}>{item}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Notes List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name={showPrivate ? 'lock' : 'sticky-note-2'} size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>
              {search ? 'Nenhuma nota encontrada' : showPrivate ? 'Nenhuma nota privada ainda' : 'Nenhuma nota criada ainda'}
            </Text>
            {!search ? (
              <Pressable
                style={styles.emptyAction}
                onPress={() => router.push({ pathname: '/note-editor', params: { private: showPrivate ? '1' : '0' } })}
              >
                <Text style={styles.emptyActionText}>
                  {showPrivate ? 'Criar nota privada' : 'Criar primeira nota'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            onPress={() => handleEdit(item)}
            onPin={() => togglePin(item.id)}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] }, Shadow.brand]}
        onPress={() => router.push({ pathname: '/note-editor', params: { private: showPrivate ? '1' : '0' } })}
      >
        <MaterialIcons name="add" size={28} color={Colors.white} />
      </Pressable>

      {/* PIN Modal */}
      <PinModal
        visible={showPinModal}
        mode={pinMode}
        onSuccess={handlePinSuccess}
        onClose={() => setShowPinModal(false)}
      />
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
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text },
  count: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  privateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  privateBtnActive: { borderColor: Colors.warning, backgroundColor: Colors.warningDim },
  privateBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  privateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.warningDim,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
  },
  privateBannerText: { fontSize: FontSize.xs, color: Colors.warning },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.base,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.base },
  categoriesOuter: { height: 50 },
  categoriesContent: { paddingHorizontal: Spacing.base, alignItems: 'center', gap: Spacing.sm },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.brand, borderColor: Colors.brand },
  catText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catTextActive: { color: Colors.white },
  listContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxxl, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center' },
  emptyAction: {
    backgroundColor: Colors.brandSurface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  emptyActionText: { color: Colors.brandLight, fontWeight: FontWeight.semibold },
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
