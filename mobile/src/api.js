// Backend client for the NoteJet iOS app. Same API as web/extension:
// a Bearer session token when signed in, otherwise a per-install client id.
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = "https://api.notejet.app";

let _clientId = null;
async function clientId() {
  if (_clientId) return _clientId;
  let id = await AsyncStorage.getItem("clientId");
  if (!id) {
    id = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 12);
    await AsyncStorage.setItem("clientId", id);
  }
  _clientId = id;
  return id;
}

async function token() {
  return AsyncStorage.getItem("token");
}

async function authHeaders() {
  const t = await token();
  return t ? { Authorization: `Bearer ${t}` } : { "X-Client-Id": await clientId() };
}

async function post(path, body, withAuth = true) {
  const headers = { "Content-Type": "application/json", ...(withAuth ? await authHeaders() : {}) };
  let res, data = {};
  try {
    res = await fetch(BASE + path, { method: "POST", headers, body: JSON.stringify(body || {}) });
    try {
      data = await res.json();
    } catch {}
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: "Network error — check your connection." } };
  }
}

export const api = {
  me: () => post("/me", {}),
  requestCode: (email) => post("/auth/request", { email }, false),
  verifyCode: async (email, code) =>
    post("/auth/verify", { email, code, clientId: await clientId() }, false),
  setUsername: (username) => post("/auth/username", { username }),
  generate: (payload) => post("/generate", payload),
  history: () => post("/history/list", {}),
  listDecks: () => post("/decks/list", {}),
  getDeck: (id) => post("/decks/get", { id }),
  saveDeck: (deck) => post("/decks/save", deck),
  deleteDeck: (id) => post("/decks/delete", { id }),
  setToken: (t) => AsyncStorage.setItem("token", t),
  signOut: () => AsyncStorage.removeItem("token"),
};
