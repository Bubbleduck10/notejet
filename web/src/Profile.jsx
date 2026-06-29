import { useEffect, useState } from "react";
import { api } from "./api.js";

const initialsOf = (name) => (name || "?").slice(0, 2).toUpperCase();

const fmtDate = (s) =>
  new Date(typeof s === "number" ? s * 1000 : s).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const money = (amount, currency) =>
  (amount / 100).toLocaleString(undefined, {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
  });

export default function Profile({ account, go }) {
  const [history, setHistory] = useState(null);
  const [payments, setPayments] = useState(null);

  useEffect(() => {
    api.history().then(({ ok, data }) => setHistory(ok ? data.history || [] : []));
    api.payments().then(({ ok, data }) => setPayments(ok ? data.payments || [] : []));
  }, []);

  const isPro = account.tier === "pro";

  return (
    <div className="container narrow profile">
      <div className="profile-head">
        <div className={"avatar lg" + (isPro ? " pro" : "")}>
          {initialsOf(account.username || account.email)}
        </div>
        <div className="profile-id">
          <h1 className="profile-name">{account.username || account.email}</h1>
          {account.username && <p className="profile-email-sub">{account.email}</p>}
          <p className="profile-meta">
            <span className={"pill" + (isPro ? " pill-pro" : "")}>{isPro ? "Pro" : "Free"}</span>
            <span className="muted-sm">{account.creditsRemaining} credits</span>
          </p>
        </div>
        <button className="btn primary sm profile-cta" onClick={() => go("pricing")}>
          {isPro ? "Get more credits" : "Upgrade"}
        </button>
      </div>

      <section className="profile-section">
        <h2>Recent requests</h2>
        {history == null ? (
          <p className="muted-sm">Loading…</p>
        ) : history.length === 0 ? (
          <p className="muted-sm">
            No requests yet — make your first set of notes on the “Try it” tab.
          </p>
        ) : (
          <ul className="hist-list">
            {history.map((h, i) => (
              <li key={i}>
                <span className="hist-title">{h.title || "Untitled"}</span>
                <span className="hist-meta">
                  {h.cost} {h.cost === 1 ? "credit" : "credits"} · {fmtDate(h.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="profile-section">
        <h2>Payment history</h2>
        {payments == null ? (
          <p className="muted-sm">Loading…</p>
        ) : payments.length === 0 ? (
          <p className="muted-sm">No payments yet.</p>
        ) : (
          <ul className="pay-list">
            {payments.map((p, i) => (
              <li key={i}>
                <span className="pay-amount">{money(p.amount, p.currency)}</span>
                <span className="pay-desc">{p.description}</span>
                <span className={"pay-status " + p.status}>{p.status}</span>
                <span className="muted-sm pay-date">{fmtDate(p.date)}</span>
                {p.receiptUrl && (
                  <a className="pay-receipt" href={p.receiptUrl} target="_blank" rel="noreferrer">
                    Receipt
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
