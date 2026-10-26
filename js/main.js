// Decides what's on screen: login, pendant registration, or the dashboard.
// Everything lives on one page, so there's no page-to-page redirect that can loop.
import { auth, configMissing, onAuthStateChanged, signOut } from "./firebase.js";
import "./auth.js";
import { startApp, stopApp } from "./app.js";

const $ = id => document.getElementById(id);
let state = "booting";            // "auth" | "app"
let entering = null;

function showAuth() {
  state = "auth";
  $("splash").hidden = true;
  $("app").hidden = true;
  $("auth").hidden = false;
  document.dispatchEvent(new Event("alerta:show-auth"));
}

function splashLoading(text) {
  const s = $("splash");
  s.classList.remove("splash-err");
  s.innerHTML = "";
  const span = document.createElement("span"); span.textContent = text;
  s.append(span);
  s.hidden = false;
  $("auth").hidden = true;
}

function splashError(msg) {
  const s = $("splash");
  s.innerHTML = "";
  s.classList.add("splash-err");
  const box = document.createElement("div"); box.className = "splash-box";
  const p = document.createElement("p"); p.textContent = msg;
  const row = document.createElement("div"); row.className = "btnrow";
  const retry = document.createElement("button"); retry.className = "primary"; retry.textContent = "Try again";
  retry.onclick = () => location.reload();
  const out = document.createElement("button"); out.className = "ghost"; out.textContent = "Sign out";
  out.onclick = async () => { try { await signOut(auth); } catch (_) {} showAuth(); };
  row.append(retry, out); box.append(p, row); s.append(box);
  s.hidden = false;
  $("auth").hidden = true;
}

/** Signed in → load the dashboard (or ask for pendant details if not registered yet). */
function enter() {
  const user = auth.currentUser;
  if (!user) return showAuth();
  if (state === "app") return;
  if (entering) return entering;
  entering = (async () => {
    splashLoading("Loading your dashboard…");
    try {
      const registered = await startApp(user);
      $("splash").hidden = true;
      if (registered) { state = "app"; }
      else {
        state = "auth";
        $("auth").hidden = false;
        document.dispatchEvent(new Event("alerta:need-profile"));
      }
    } catch (e) {
      console.error("Alerta: couldn't load dashboard:", e?.code || e?.message, e);
      splashError(e?.code === "permission-denied"
        ? "Firestore blocked loading your profile. Check that the rules from firestore.rules are published."
        : "Couldn't load your profile. Check your internet connection and try again.");
    } finally { entering = null; }
  })();
  return entering;
}
document.addEventListener("alerta:enter", enter);

(async () => {
  if (configMissing) return showAuth();             // auth.js shows the "add your config" message
  try { await auth.authStateReady(); } catch (_) {}
  if (auth.currentUser) enter(); else showAuth();

  // Signed out anywhere (Sign Out button, another tab, expired session) → back to login.
  onAuthStateChanged(auth, u => { if (!u && state !== "auth") { stopApp(); showAuth(); } });
})();
