import { useState, useEffect } from "react";
import { api } from "./api.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function AuthModal({ onClose, onDone }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [msg, setMsg] = useState("");

  // Render Google's "Continue with Google" button once the GSI script is ready.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let tries = 0;
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            setMsg("Signing in…");
            const { ok, data } = await api.googleAuth(resp.credential);
            if (ok) {
              api.setToken(data.token);
              onDone();
            } else setMsg(data.error || "Google sign-in failed.");
          },
        });
        const el = document.getElementById("gbtn");
        if (el) {
          window.google.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large",
            width: 300,
            text: "continue_with",
          });
        }
      } else if (++tries > 30) {
        clearInterval(timer);
      }
    }, 150);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send() {
    if (!email.trim()) return setMsg("Enter your email.");
    setMsg("Sending code…");
    const { ok, data } = await api.requestCode(email.trim());
    if (ok) {
      setSent(true);
      setMsg("We emailed you a 6-digit code.");
    } else setMsg(data.error || "Could not send code.");
  }

  async function verify() {
    setMsg("Verifying…");
    const { ok, data } = await api.verifyCode(email.trim(), code.trim());
    if (ok) {
      api.setToken(data.token);
      onDone();
    } else setMsg(data.error || "Verification failed.");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className="modal-title">Sign in to NoteJet</h2>
        <p className="modal-sub">
          {GOOGLE_CLIENT_ID
            ? "Continue with Google, or get a one-time email code."
            : "No password — we'll email you a one-time code."}
        </p>

        {GOOGLE_CLIENT_ID && <div id="gbtn" className="gbtn" />}
        {GOOGLE_CLIENT_ID && (
          <div className="divider">
            <span>or</span>
          </div>
        )}

        <input
          className="field"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {sent && (
          <input
            className="field"
            type="text"
            placeholder="6-digit code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        )}

        {!sent ? (
          <button className="btn primary full" onClick={send}>
            Email me a code
          </button>
        ) : (
          <button className="btn primary full" onClick={verify}>
            Verify &amp; sign in
          </button>
        )}

        {msg && <p className="modal-msg">{msg}</p>}
      </div>
    </div>
  );
}
