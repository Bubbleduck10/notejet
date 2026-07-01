import { useEffect } from "react";
import { useShareIntent } from "expo-share-intent";

// Watches for content shared into NoteJet (Share → NoteJet). Turns it into a
// pending payload and jumps to the Create tab. Only mounted in a real build
// (never in Expo Go — see App.js guard).
export default function ShareListener({ setPending, navigationRef }) {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (!hasShareIntent) return;
    let payload = null;
    if (shareIntent?.webUrl) {
      payload = { url: shareIntent.webUrl };
    } else if (shareIntent?.text) {
      const t = String(shareIntent.text).trim();
      payload = /^https?:\/\//i.test(t) ? { url: t } : { text: t };
    }
    if (payload) {
      setPending({ ...payload, id: Date.now() });
      if (navigationRef?.isReady?.()) navigationRef.navigate("Create");
    }
    resetShareIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareIntent]);

  return null;
}
