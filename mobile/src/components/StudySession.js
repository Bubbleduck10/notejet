import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, GRADIENT } from "../theme";
import GradientButton from "./GradientButton";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Flashcard study over a deck's quiz. Flip to reveal, then mark "Got it" (retire)
// or "Again" (requeue to the end). Finishes when every card is mastered.
export default function StudySession({ title, quiz, onExit }) {
  const insets = useSafeAreaInsets();
  const total = quiz.length;
  const [queue, setQueue] = useState(() => shuffle(quiz));
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(0);

  const card = queue[0];
  const done = queue.length === 0;

  function gotIt() {
    setMastered((m) => m + 1);
    setFlipped(false);
    setQueue((q) => q.slice(1));
  }
  function again() {
    setFlipped(false);
    setQueue((q) => (q.length > 1 ? [...q.slice(1), q[0]] : q));
    // if it's the only card left, just flip back so they can retry
  }

  const progress = total ? mastered / total : 0;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.top}>
        <TouchableOpacity onPress={onExit} hitSlop={10}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.counter}>
          {done ? total : mastered} / {total}
        </Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]}
        />
      </View>

      {done ? (
        <View style={styles.center}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Deck mastered!</Text>
          <Text style={styles.doneSub}>You reviewed all {total} cards in “{title}.”</Text>
          <GradientButton title="Done" onPress={onExit} style={{ marginTop: 22, alignSelf: "stretch" }} />
        </View>
      ) : (
        <>
          <Pressable style={styles.card} onPress={() => setFlipped((f) => !f)}>
            <Text style={styles.face}>{flipped ? "ANSWER" : "QUESTION"}</Text>
            <Text style={styles.cardText}>{flipped ? card.answer : card.question}</Text>
            <Text style={styles.hint}>{flipped ? "" : "Tap to flip"}</Text>
          </Pressable>

          <View style={styles.actions}>
            {flipped ? (
              <>
                <TouchableOpacity style={[styles.btn, styles.againBtn]} onPress={again} activeOpacity={0.85}>
                  <Text style={styles.againText}>↻ Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.gotBtn]} onPress={gotIt} activeOpacity={0.85}>
                  <Text style={styles.gotText}>✓ Got it</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.btn, styles.flipBtn]} onPress={() => setFlipped(true)} activeOpacity={0.85}>
                <Text style={styles.flipText}>Reveal answer</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 18 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  close: { color: colors.muted, fontSize: 20, fontWeight: "700", width: 20 },
  counter: { color: colors.text, fontWeight: "800", fontSize: 15 },
  track: { height: 6, backgroundColor: colors.bgElev, borderRadius: 999, overflow: "hidden", marginBottom: 20 },
  fill: { height: 6, borderRadius: 999 },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  face: { color: colors.violet, fontWeight: "800", fontSize: 12, letterSpacing: 2, marginBottom: 16 },
  cardText: { color: colors.text, fontSize: 22, fontWeight: "700", textAlign: "center", lineHeight: 30 },
  hint: { color: colors.faint, fontSize: 13, marginTop: 20 },
  actions: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  flipBtn: { backgroundColor: colors.bgElev, borderWidth: 1, borderColor: colors.cardBorder },
  flipText: { color: colors.text, fontWeight: "700", fontSize: 16 },
  againBtn: { backgroundColor: colors.bgElev, borderWidth: 1, borderColor: colors.cardBorder },
  againText: { color: colors.muted, fontWeight: "700", fontSize: 16 },
  gotBtn: { backgroundColor: colors.success },
  gotText: { color: "#04170f", fontWeight: "800", fontSize: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  doneEmoji: { fontSize: 54, marginBottom: 10 },
  doneTitle: { color: colors.text, fontSize: 24, fontWeight: "800" },
  doneSub: { color: colors.muted, fontSize: 15, marginTop: 8, textAlign: "center" },
});
