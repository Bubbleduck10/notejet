import { createContext, useContext } from "react";

// Holds the latest content shared into the app via the iOS Share Extension.
// CreateScreen consumes this to auto-fill and generate.
export const ShareContext = createContext({ pending: null, clear: () => {} });
export const useShare = () => useContext(ShareContext);
