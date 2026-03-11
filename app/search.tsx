import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet,
  SectionList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotes } from '../hooks/useNotes';
import { useTasks } from '../hooks/useTasks';
import { useCalendar } from '../hooks/useCalendar';
import { Colors, Spacing, FontSize, FontWeight, Radius } from '../constants/theme';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';

type ResultType = 'note' | 'task' | 'event';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  meta?: string;
  priority?: string;
  status?: string;
  color?: string;
}

function highlight(text: string, query: string): { before: string; match: string; after: string } | null {
  if (!query.trim()) return null;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return null;
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + query.length),
    after: text.slice(idx + query.length),
  };
}

function HighlightText({ text, query, style, matchStyle }: {
  text: string;
  query: string;
  style?: any;
  matchStyle?: any;
}) {
  const parts = highlight(text, query);
  if (!parts) return <Text style={style} numberOfLines={1}>{text}</Text>;
  return (
    <Text style={style} numberOfLines={1}>
      {parts.before}
      <Text style={[style, matchStyle || styles.matchHighlight]}>{parts.match}</Text>
      {parts.after}
    </Text>
  );
}

const ICON_MAP: Record<ResultType, keyof typeof MaterialIcons.glyphMap> = {
  note: 'sticky-note-2',
  task: 'check-circle-outline',
  event: 'event',
};

const TYPE_COLOR: Record<ResultType, string> = {
  note: Colors.info,
  task: Colors.brand,
  event: Colors.warning,
};

const TYPE_LABEL: Record<ResultType, string> = {
  note: 'Nota',
  task: 'Tarefa',
  event: 'Evento',
};

function ResultCard({ item, query, onPress }: { item: SearchResult; query: string; onPress: () => void }) {
  const typeColor = item.color || TYPE_COLOR[item.type];
  return (
    <Pressable
      style={({ pressed }) => [styles.resultCard, pressed && styles.resultCardPressed]}
      onPress={onPress}
    >
      <View style={[styles.resultIcon, { backgroundColor: typeColor + '22' }]}>
        <MaterialIcons name={ICON_MAP[item.type]} size={20} color={typeColor} />
      </View>
      <View style={styles.resultBody}>
        <View style={styles.resultHeader}>
          <HighlightText
            text={item.title || 'Sem título'}
            query={query}
            style={styles.resultTitle}
          />
          <View style={[styles.typePill, { backgroundColor: typeColor + '22' }]}>
            <Text style={[styles.typePillText, { color: typeColor }]}>{TYPE_LABEL[item.type]}</Text>
          </View>
        </View>
        {item.subtitle ? (
          <HighlightText
            text={item.subtitle}
            query={query}
            style={styles.resultSubtitle}
          />
        ) : null}
        <View style={styles.resultMeta}>
          {item.priority ? <PriorityBadge priority={item.priority as any} /> : null}
          {item.status ? <StatusBadge status={item.status as any} /> : null}
          {item.meta ? <Text style={styles.metaText}>{item.meta}</Text> : null}
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
    </Pressable>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes } = useNotes();
  const { tasks } = useTasks();
  const { events } = useCalendar();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const results = useMemo((): SearchResult[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const out: SearchResult[] = [];

    // Notes (public only)
    notes
      .filter(n => !n.isPrivate)
      .forEach(n => {
        const inTitle = n.title.toLowerCase().includes(q);
        const inContent = n.content.toLowerCase().includes(q);
        if (inTitle || inContent) {
          out.push({
            id: n.id,
            type: 'note',
            title: n.title || 'Sem título',
            subtitle: n.content.slice(0, 80),
            meta: new Date(n.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          });
        }
      });

    // Tasks
    tasks.forEach(t => {
      const inTitle = t.title.toLowerCase().includes(q);
      const inDesc = t.description?.toLowerCase().includes(q);
      if (inTitle || inDesc) {
        out.push({
          id: t.id,
          type: 'task',
          title: t.title,
          subtitle: t.description || '',
          priority: t.priority,
          status: t.status,
          meta: t.dueDate
            ? new Date(t.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
            : undefined,
        });
      }
    });

    // Events
    events.forEach(e => {
      const inTitle = e.title.toLowerCase().includes(q);
      const inDesc = e.description?.toLowerCase().includes(q);
      if (inTitle || inDesc) {
        out.push({
          id: e.id,
          type: 'event',
          title: e.title,
          subtitle: e.description || '',
          color: e.color,
          meta: `${new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · ${e.time}`,
        });
      }
    });

    return out;
  }, [query, notes, tasks, events]);

  // Group by type for section display
  const sections = useMemo(() => {
    const groups: Record<ResultType, SearchResult[]> = { note: [], task: [], event: [] };
    results.forEach(r => groups[r.type].push(r));
    return (['note', 'task', 'event'] as ResultType[])
      .filter(t => groups[t].length > 0)
      .map(t => ({
        title: TYPE_LABEL[t],
        type: t,
        data: groups[t],
      }));
  }, [results]);

  const handleNavigate = useCallback((item: SearchResult) => {
    if (item.type === 'note') {
      router.push({ pathname: '/note-editor', params: { id: item.id } });
    } else if (item.type === 'task') {
      router.push({ pathname: '/task-editor', params: { id: item.id } });
    } else if (item.type === 'event') {
      router.push({ pathname: '/event-editor', params: { id: item.id } });
    }
  }, [router]);

  const recentItems = useMemo(() => {
    const recent: SearchResult[] = [];
    [...notes]
      .filter(n => !n.isPrivate)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 3)
      .forEach(n => recent.push({
        id: n.id, type: 'note',
        title: n.title || 'Sem título',
        subtitle: n.content.slice(0, 60),
        meta: new Date(n.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      }));
    [...tasks]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 2)
      .forEach(t => recent.push({
        id: t.id, type: 'task',
        title: t.title,
        subtitle: t.description || '',
        priority: t.priority,
        status: t.status,
      }));
    return recent.slice(0, 5);
  }, [notes, tasks]);

  const totalCount = tasks.length + notes.filter(n => !n.isPrivate).length + events.length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.textSecondary} />
          </Pressable>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar notas, tarefas, eventos..."
              placeholderTextColor={Colors.textMuted}
              selectionColor={Colors.brand}
              autoFocus
              returnKeyType="search"
              clearButtonMode="never"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={18} color={Colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Scope pills */}
        <View style={styles.scopeRow}>
          {(['note', 'task', 'event'] as ResultType[]).map(type => (
            <View key={type} style={styles.scopePill}>
              <MaterialIcons name={ICON_MAP[type]} size={12} color={TYPE_COLOR[type]} />
              <Text style={[styles.scopeText, { color: TYPE_COLOR[type] }]}>{TYPE_LABEL[type]}s</Text>
            </View>
          ))}
          <Text style={styles.scopeTotal}>{totalCount} itens indexados</Text>
        </View>

        {query.trim() === '' ? (
          // Empty state — show recents
          <View style={{ flex: 1 }}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="history" size={14} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>Recentes</Text>
            </View>
            <FlatList
              data={recentItems}
              keyExtractor={item => item.id + item.type}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <MaterialIcons name="search" size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyTitle}>Busca global</Text>
                  <Text style={styles.emptySubtitle}>
                    Digite para pesquisar em todas as suas notas, tarefas e eventos ao mesmo tempo.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <ResultCard item={item} query="" onPress={() => handleNavigate(item)} />
              )}
            />
          </View>
        ) : results.length === 0 ? (
          // No results
          <View style={styles.noResults}>
            <MaterialIcons name="search-off" size={48} color={Colors.textMuted} />
            <Text style={styles.noResultsTitle}>Sem resultados</Text>
            <Text style={styles.noResultsSub}>Nenhum item encontrado para "{query}"</Text>
          </View>
        ) : (
          // Results with sections
          <SectionList
            sections={sections}
            keyExtractor={item => item.id + item.type}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name={ICON_MAP[section.type as ResultType]}
                  size={14}
                  color={TYPE_COLOR[section.type as ResultType]}
                />
                <Text style={[styles.sectionTitle, { color: TYPE_COLOR[section.type as ResultType] }]}>
                  {section.title}s
                </Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{section.data.length}</Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <ResultCard item={item} query={query} onPress={() => handleNavigate(item)} />
            )}
            ListHeaderComponent={
              <View style={styles.resultsCount}>
                <Text style={styles.resultsCountText}>
                  {results.length} resultado{results.length !== 1 ? 's' : ''} para <Text style={{ color: Colors.brandLight }}>"{query}"</Text>
                </Text>
              </View>
            }
          />
        )}
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
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  backBtn: { padding: Spacing.xs },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.base,
  },
  scopeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  scopePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scopeText: { fontSize: 10, fontWeight: FontWeight.semibold },
  scopeTotal: { marginLeft: 'auto', fontSize: FontSize.xs, color: Colors.textMuted },
  listContent: { paddingHorizontal: Spacing.base, paddingBottom: 100, paddingTop: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.textMuted,
  },
  sectionBadge: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    marginLeft: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionBadgeText: { fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultCardPressed: {
    backgroundColor: Colors.surfaceAlt,
    transform: [{ scale: 0.985 }],
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBody: { flex: 1, gap: 3 },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  resultTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flex: 1,
  },
  typePill: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  typePillText: { fontSize: 9, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  matchHighlight: {
    backgroundColor: Colors.brand + '44',
    color: Colors.brandLight,
    fontWeight: FontWeight.bold,
  },
  resultsCount: {
    paddingVertical: Spacing.sm,
  },
  resultsCountText: { fontSize: FontSize.sm, color: Colors.textMuted },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl * 1.5,
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  noResultsTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  noResultsSub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
});
