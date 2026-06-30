import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { api } from "../api";
import { colors } from "../theme";

export default function AccountScreen() {
  const [step, setStep] = useState("loading"); // loading | out | sent | username | in
  const [account, setAccount] = useState(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  const refresh = useCallback(async () => {
    const { ok, data } = await api.me();
    if (ok && data.signedIn) {
      setAccount(data);
      setStep("in");
    } else {
      setAccount(null);
      setStep((s) => (s === "loading" || s === "in" ? "out" : s));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function sendCode() {
    if (!email.trim()) return setStatus("Enter your email.");
    setStatus("Sending code…");
    const { ok, data } = await api.requestCode(email.trim());
    if (ok) {
      setStep("sent");
      setStatus("We emailed you a 6-digit code.");
    } else setStatus(data.error || "Could not send code.");
  }

  async function verify() {
    setStatus("Verifying…");
    const { ok, data } = await api.verifyCode(email.trim(), code.trim());
    if (!ok) return setStatus(data.error || "Verification failed.");
    await api.setToken(data.token);
    if (data.needsUsername) {
      setStatus("");
      setStep("username");
    } else {
      setStatus("");
      refresh();
    }
  }

  async function saveUsername() {
    if (!username.trim()) return setStatus("Pick a username.");
    setStatus("Saving…");
    const { ok, data } = await api.setUsername(username.trim());
    if (ok) {
      setStatus("");
      refresh();
    } else setStatus(data.error || "Could not set username.");
  }

  async function signOut() {
    await api.signOut();
    setEmail("");
    setCode("");
    setUsername("");
    setStatus("");
    setStep("out");
    setAccount(null);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.scroll}>
      {step === "loading" && <ActivityIndicator color={colors.indigo} style={{ marginTop: 40 }} />}

      {step === "in" && account && (
        <View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(account.username || account.email || "?").slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{account.username || account.email}</Text>
          {account.username ? <Text style={styles.emailSub}>{account.email}</Text> : null}
          <View style={styles.statRow}>
            <View style={[styles.pill, account.tier === "pro" && styles.pillPro]}>
              <Text style={[styles.pillText, account.tier === "pro" && styles.pillProText]}>
                {account.tier === "pro" ? "Pro" : "Free"}
              </Text>
            </View>
            <Text style={styles.credits}>{account.creditsRemaining} credits</Text>
          </View>
          {account.tier !== "pro" && (
            <Text style={styles.hint}>
              Manage your plan and get more credits at notejet.app.
            </Text>
          )}
          <TouchableOpacity style={styles.outBtn} onPress={signOut}>
            <Text style={styles.outText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      )}

      {(step === "out" || step === "sent") && (
        <View>
          <Text style={styles.h1}>Sign in</Text>
          <Text style={styles.sub}>We'll email you a one-time code — no password.</Text>
          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            placeholderTextColor={colors.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          {step === "sent" && (
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              placeholderTextColor={colors.muted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          )}
          <TouchableOpacity style={styles.cta} onPress={step === "sent" ? verify : sendCode}>
            <Text style={styles.ctaText}>{step === "sent" ? "Verify & sign in" : "Email me a code"}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            New here? You'll pick a username next. Buy Pro on notejet.app and it carries over.
          </Text>
        </View>
      )}

      {step === "username" && (
        <View>
          <Text style={styles.h1}>Choose a username</Text>
          <Text style={styles.sub}>This is your display name across NoteJet.</Text>
          <TextInput
            style={styles.input}
            placeholder="username"
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />
          <Text style={styles.fine}>3–20 characters · letters, numbers, underscore</Text>
          <TouchableOpacity style={styles.cta} onPress={saveUsername}>
            <Text style={styles.ctaText}>Finish</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!status && <Text style={styles.status}>{status}</Text>}
    </ScrollView>
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
  cta: { backgroundColor: colors.indigo, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 4 },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  hint: { color: colors.muted, fontSize: 13, marginTop: 14, lineHeight: 19 },
  fine: { color: colors.muted, fontSize: 12, marginBottom: 10 },
  status: { color: colors.muted, fontSize: 14, marginTop: 14, textAlign: "center" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.indigo,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { color: "#fff", fontWeight: "800", fontSize: 26 },
  name: { fontSize: 22, fontWeight: "800", color: colors.text },
  emailSub: { color: colors.muted, fontSize: 14, marginTop: 2 },
  statRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 10 },
  pill: { backgroundColor: colors.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  pillPro: { backgroundColor: colors.indigo },
  pillText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  pillProText: { color: "#fff" },
  credits: { color: colors.text, fontWeight: "600", fontSize: 15 },
  outBtn: { marginTop: 24, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  outText: { color: colors.danger, fontWeight: "600" },
});
