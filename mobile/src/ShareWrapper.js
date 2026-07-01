import { ShareIntentProvider } from "expo-share-intent";
import ShareListener from "./ShareListener";

// Wraps the app with the share-intent provider and mounts the listener.
// This whole module is only required in a real build (App.js skips it in Expo Go),
// so expo-share-intent's native module is never touched inside Expo Go.
export default function ShareWrapper({ children, setPending, navigationRef }) {
  return (
    <ShareIntentProvider>
      {children}
      <ShareListener setPending={setPending} navigationRef={navigationRef} />
    </ShareIntentProvider>
  );
}
