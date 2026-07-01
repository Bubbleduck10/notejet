import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api";
import { colors } from "../theme";
import StudySession from "../components/StudySession";
import GradientButton from "../components/GradientButton";

export default function DecksScreen() {
  const insets = useSafeAreaInsets();
  const [decks, setDecks] = useState(null);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [studying, setStudying] = useState(false);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setSelected(null);
    setStudying(false);
    setDecks(null);
    const { ok, data } = await api.listDecks();
    setDecks(ok ? data.decks || [] : []);
    if (!ok) setStatus(data.error || "Couldn't load decks.");
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function open(id) {
    setStatus("Opening…");
    const { ok, data } = await api.getDeck(id);
    if (ok) {
      setSelected(data);
      setRevealed({});
      setStatus("");
    } else setStatus(data.error || "Couldn't open deck.");
  }

  async function remove(id) {
    await api.deleteDeck(id);
    load();
  }

  const fmt = (s) => new Date(s).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const pad = { paddingTop: insets.top + 14, paddingBottom: 130 };

  if (selected && studying) {
    return (
      <StudySession
        title={selected.title}
        quiz={selected.quiz || []}
        onExit={() => setStudying(false)}
      />
    );
  }

  if (selected) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, pad]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => setSelected(null)}>
          <Text style={styles.back}>‹  All decks</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selected.title}</Text>
        {selected.quiz?.length > 0 && (
          <GradientButton
            title={`▶  Study ${selected.quiz.length} cards`}
            onPress={() => setStudying(true)}
            style={{ marginBottom: 18 }}
          />
        )}
        {selected.notes?.map((n, i) => (
          <View key={i} style={styles.noteRow}>
            <View style={styles.dot} />
            <Text style={styles.note}>{n}</Text>
          </View>
        ))}
        <Text style={styles.quizLabel}>QUIZ</Text>
        {selected.quiz?.map((q, i) => (
          <View key={i} style={styles.qCard}>
            <Text style={styles.q}>Q{i + 1}. {q.question}</Text>
            {revealed[i] ? (
              <Text style={styles.a}>{q.answer}</Text>
            ) : (
              <TouchableOpacity onPress={() => setRevealed((r) => ({ ...r, [i]: true }))}>
                <Text style={styles.reveal}>Show answer</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(selected.id)}>
          <Text style={styles.deleteText}>Delete deck</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, pad]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.brand}>NOTEJET</Text>
      <Text style={styles.h1}>Your decks</Text>
      {decks == null ? (
        <ActivityIndicator color={colors.violet} style={{ marginTop: 30 }} />
      ) : decks.length === 0 ? (
        <Text style={styles.empty}>
          No saved decks yet. Make notes on the Create tab and tap “Save to Decks.”
        </Text>
      ) : (
        decks.map((d) => (
          <TouchableOpacity key={d.id} style={styles.row} onPress={() => open(d.id)} activeOpacity={0.8}>
            <Text style={styles.rowTitle} numberOfLines={1}>{d.title}</Text>
            <Text style={styles.rowDate}>{fmt(d.created_at)}</Text>
          </TouchableOpacity>
        ))
      )}
      {!!status && <Text style={styles.status}>{status}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18 },
  brand: { color: colors.violet, fontWeight: "800", fontSize: 12, letterSpacing: 3, marginBottom: 6 },
  h1: { fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -0.5, marginBottom: 16 },
  empty: { color: colors.muted, fontSize: 15, marginTop: 20, lineHeight: 22 },
  row: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.text, marginRight: 10 },
  rowDate: { color: colors.faint, fontSize: 13 },
  back: { color: colors.violet, fontWeight: "700", fontSize: 16, marginBottom: 14 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 16 },
  noteRow: { flexDirection: "row", marginBottom: 10, alignItems: "flex-start" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.violet, marginTop: 7, marginRight: 12 },
  note: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  quizLabel: { color: colors.pink, fontWeight: "800", fontSize: 12, letterSpacing: 1.5, marginTop: 16, marginBottom: 10 },
  qCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 14, padding: 14, marginBottom: 10 },
  q: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 8, lineHeight: 21 },
  a: { fontSize: 15, color: colors.success, lineHeight: 21 },
  reveal: { color: colors.violet, fontWeight: "700" },
  deleteBtn: { marginTop: 12, alignItems: "center", paddingVertical: 12 },
  deleteText: { color: colors.danger, fontWeight: "700" },
  status: { color: colors.muted, fontSize: 14, marginTop: 14, textAlign: "center" },
});
