import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { api } from "../api";
import { colors } from "../theme";

export default function CreateScreen() {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState({});

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
    });
    if (!res.canceled && res.assets?.[0]) {
      const a = res.assets[0];
      setImage({ data: a.base64, mediaType: a.mimeType || "image/jpeg", uri: a.uri });
      setStatus("");
    }
  }

  async function run() {
    let payload;
    if (text.trim()) payload = { text: text.trim() };
    else if (url.trim()) payload = { url: url.trim() };
    else if (image) payload = { image: { data: image.data, mediaType: image.mediaType } };
    else return setStatus("Add a link, some text, or a screenshot.");

    setLoading(true);
    setResult(null);
    setRevealed({});
    setStatus(payload.url ? "Reading the link…" : "Thinking…");
    const { ok, status: s, data } = await api.generate(payload);
    setLoading(false);
    if (s === 402)
      return setStatus(
        `Not enough credits — needs ${data.creditsNeeded}, you have ${data.creditsRemaining}.`,
      );
    if (!ok) return setStatus(data.error || "Something went wrong.");
    setResult(data);
    setStatus(
      data.creditsUsed ? `Done — used ${data.creditsUsed} credit${data.creditsUsed > 1 ? "s" : ""}.` : "",
    );
  }

  async function save() {
    if (!result) return;
    setStatus("Saving…");
    const { ok, data } = await api.saveDeck({
      title: result.title,
      notes: result.notes,
      quiz: result.quiz,
    });
    setStatus(ok ? "Saved to Decks." : data.error || "Save failed.");
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.h1}>Make study notes</Text>
        <Text style={styles.sub}>Paste a link, drop in text, or pick a screenshot.</Text>

        <TextInput
          style={styles.input}
          placeholder="YouTube or article link"
          placeholderTextColor={colors.muted}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="…or paste a transcript / notes"
          placeholderTextColor={colors.muted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={styles.imgBtn} onPress={pickImage}>
          <Text style={styles.imgBtnText}>
            {image ? "✓ Screenshot selected — tap to change" : "📷  Pick a screenshot"}
          </Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />}

        <TouchableOpacity style={styles.cta} onPress={run} disabled={loading} activeOpacity={0.85}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>Generate notes & quiz</Text>
          )}
        </TouchableOpacity>
        {!!status && <Text style={styles.status}>{status}</Text>}

        {result && (
          <View style={styles.result}>
            <Text style={styles.title}>{result.title}</Text>
            {result.notes?.map((n, i) => (
              <View key={i} style={styles.noteRow}>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.note}>{n}</Text>
              </View>
            ))}
            <Text style={styles.quizLabel}>QUIZ</Text>
            {result.quiz?.map((q, i) => (
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
            <TouchableOpacity style={styles.saveBtn} onPress={save}>
              <Text style={styles.saveText}>💾  Save to Decks</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 18, paddingBottom: 48 },
  h1: { fontSize: 26, fontWeight: "800", color: colors.text },
  sub: { fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: 18 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
  },
  textarea: { height: 110, textAlignVertical: "top" },
  imgBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  imgBtnText: { color: colors.text, fontWeight: "600" },
  preview: { width: "100%", height: 160, borderRadius: 12, marginBottom: 14 },
  cta: {
    backgroundColor: colors.indigo,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: colors.indigo,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  status: { color: colors.muted, fontSize: 14, marginTop: 12, textAlign: "center" },
  result: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
  },
  title: { fontSize: 19, fontWeight: "800", color: colors.text, marginBottom: 12 },
  noteRow: { flexDirection: "row", marginBottom: 8 },
  dot: { color: colors.indigo, fontSize: 16, marginRight: 8, lineHeight: 22 },
  note: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  quizLabel: { color: colors.pink, fontWeight: "800", fontSize: 12, marginTop: 14, marginBottom: 8 },
  qCard: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  q: { fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 6 },
  a: { fontSize: 15, color: colors.success, lineHeight: 21 },
  reveal: { color: colors.indigo, fontWeight: "600" },
  saveBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: { color: colors.text, fontWeight: "600" },
});
