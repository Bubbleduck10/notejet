import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { api } from "../api";
import { colors } from "../theme";

export default function DecksScreen() {
  const [decks, setDecks] = useState(null);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setSelected(null);
    setDecks(null);
    const { ok, data } = await api.listDecks();
    setDecks(ok ? data.decks || [] : []);
    if (!ok) setStatus(data.error || "Couldn't load decks.");
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

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

  if (selected) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setSelected(null)}>
          <Text style={styles.back}>‹ All decks</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selected.title}</Text>
        {selected.notes?.map((n, i) => (
          <View key={i} style={styles.noteRow}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.note}>{n}</Text>
          </View>
        ))}
        <Text style={styles.quizLabel}>QUIZ</Text>
        {selected.quiz?.map((q, i) => (
          <View key={i} style={styles.qCard}>
            <Text style={styles.q}>
              Q{i + 1}. {q.question}
            </Text>
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
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>Your decks</Text>
      {decks == null ? (
        <ActivityIndicator color={colors.indigo} style={{ marginTop: 30 }} />
      ) : decks.length === 0 ? (
        <Text style={styles.empty}>
          No saved decks yet. Make notes on the Create tab and tap “Save to Decks.”
        </Text>
      ) : (
        decks.map((d) => (
          <TouchableOpacity key={d.id} style={styles.row} onPress={() => open(d.id)}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {d.title}
            </Text>
            <Text style={styles.rowDate}>{fmt(d.created_at)}</Text>
          </TouchableOpacity>
        ))
      )}
      {!!status && <Text style={styles.status}>{status}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 48 },
  h1: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: 14 },
  empty: { color: colors.muted, fontSize: 15, marginTop: 20, lineHeight: 22 },
  row: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: colors.text, marginRight: 10 },
  rowDate: { color: colors.muted, fontSize: 13 },
  back: { color: colors.indigo, fontWeight: "600", fontSize: 16, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text, marginBottom: 14 },
  noteRow: { flexDirection: "row", marginBottom: 8 },
  dot: { color: colors.indigo, fontSize: 16, marginRight: 8, lineHeight: 22 },
  note: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  quizLabel: { color: colors.pink, fontWeight: "800", fontSize: 12, marginTop: 14, marginBottom: 8 },
  qCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginBottom: 8 },
  q: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 6 },
  a: { fontSize: 15, color: colors.success, lineHeight: 21 },
  reveal: { color: colors.indigo, fontWeight: "600" },
  deleteBtn: { marginTop: 12, alignItems: "center", paddingVertical: 12 },
  deleteText: { color: colors.danger, fontWeight: "600" },
  status: { color: colors.muted, fontSize: 14, marginTop: 12, textAlign: "center" },
});
