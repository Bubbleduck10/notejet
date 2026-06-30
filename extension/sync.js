// Syncs NoteJet website sign-in into the extension. Runs on notejet.app.
// Reads the web app's session token from the page's localStorage and mirrors it
// into chrome.storage, so signing in on the site automatically signs in the
// extension (no fragile in-popup code entry). Also clears it on sign-out.
function sync() {
  try {
    const token = localStorage.getItem("token");
    chrome.storage.local.get(["token"], (cur) => {
      if (token && token !== cur.token) {
        chrome.storage.local.set({ token });
      } else if (!token && cur.token) {
        chrome.storage.local.remove(["token", "email"]);
      }
    });
  } catch (e) {
    /* ignore */
  }
}

sync();
setInterval(sync, 1500);
