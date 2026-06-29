// Creates NoteJet's LIVE Stripe products, prices, and webhook in one go.
// Run it on YOUR machine so your live key never leaves it:
//   node scripts/setup-live-stripe.mjs sk_live_xxx
// It prints the 5 live price IDs + the webhook signing secret.
const SK = process.argv[2];
if (!SK || !SK.startsWith("sk_live_")) {
  console.error("Usage: node scripts/setup-live-stripe.mjs sk_live_...");
  console.error("(Get your live secret key: Stripe → switch to LIVE mode → Developers → API keys)");
  process.exit(1);
}

const base = "https://api.stripe.com/v1/";
const auth = "Basic " + Buffer.from(SK + ":").toString("base64");
const form = (o) => Object.entries(o).map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
const post = async (p, b) => {
  const r = await fetch(base + p, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
    body: typeof b === "string" ? b : form(b),
  });
  const j = await r.json();
  if (j.error) throw new Error(p + ": " + j.error.message);
  return j;
};

(async () => {
  const pro = await post("products", { name: "NoteJet Pro" });
  const cred = await post("products", { name: "NoteJet Credits" });
  const m = await post("prices", { product: pro.id, currency: "usd", unit_amount: 699, "recurring[interval]": "month" });
  const s6 = await post("prices", { product: pro.id, currency: "usd", unit_amount: 4099, "recurring[interval]": "month", "recurring[interval_count]": 6 });
  const yr = await post("prices", { product: pro.id, currency: "usd", unit_amount: 7999, "recurring[interval]": "year" });
  const p1 = await post("prices", { product: cred.id, currency: "usd", unit_amount: 499 });
  const p3 = await post("prices", { product: cred.id, currency: "usd", unit_amount: 999 });
  const wh = await post(
    "webhook_endpoints",
    "url=" + encodeURIComponent("https://api.notejet.app/webhook/stripe") +
      "&enabled_events[]=checkout.session.completed&enabled_events[]=invoice.paid&enabled_events[]=customer.subscription.deleted",
  );

  console.log("\n=== LIVE price IDs — paste these to Claude ===");
  console.log("PRO_MONTHLY =", m.id);
  console.log("PRO_6MO     =", s6.id);
  console.log("PRO_ANNUAL  =", yr.id);
  console.log("PACK_100    =", p1.id);
  console.log("PACK_300    =", p3.id);
  console.log("\n=== Webhook signing secret — set as STRIPE_WEBHOOK_SECRET ===");
  console.log(wh.secret);
  console.log("\nThen run:");
  console.log('  & "C:\\Program Files\\nodejs\\node.exe" "node_modules\\wrangler\\bin\\wrangler.js" secret put STRIPE_SECRET_KEY      # paste your sk_live_ key');
  console.log('  & "C:\\Program Files\\nodejs\\node.exe" "node_modules\\wrangler\\bin\\wrangler.js" secret put STRIPE_WEBHOOK_SECRET  # paste the secret above');
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
