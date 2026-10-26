import {
  auth, db, signOut,
  doc, getDoc, updateDoc, collection, addDoc, query, orderBy, limit, onSnapshot,
  serverTimestamp, writeBatch, getDocs
} from "./firebase.js";

/* ---------- icons ---------- */
const P = {
  user:'<circle cx="12" cy="7" r="4"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  activity:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  volume:'<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  nav:'<path d="M3 11l19-9-9 19-2-8-8-2z"/>',
  bt:'<path d="m7 7 10 10-5 5V2l5 5L7 17"/>',
  wifi:'<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
  phoneDev:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  cog:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>',
  save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>',
  pause:'<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>', play:'<path d="M6 3l14 9-14 9z"/>',
  cross:'<circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>',
  batt:'<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  check:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>'
};
const ic = n => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || "") + "</svg>";
document.querySelectorAll("[data-ic]").forEach(el => { if (!el.querySelector("svg.i")) el.insertAdjacentHTML("afterbegin", ic(el.dataset.ic)); });

const $ = id => document.getElementById(id);
// Safe setter: if an element is missing (e.g. an old dashboard.html), skip it instead of crashing.
const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };
const setHidden = (id, v) => { const el = $(id); if (el) el.hidden = v; };
const toastEl = $("toast"); let tt;
function toast(m) { toastEl.textContent = m; toastEl.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove("on"), 2600); }
const digits = s => (s || "").replace(/\D/g, "");

/* ---------- state ---------- */
let uid = null, userRef = null, profile = null, alerts = [], view = "home";
const BASE = { lat: 12.973517, lng: 77.594135 };   // shown until the browser gives a real fix
let pos = { ...BASE }, gpsReal = false, live = true, watchId = null, lastSaved = 0;
let fallHandled = false, pendingFall = false, fallTimer = null, fallSeconds = 5;

async function save(fields) {
  try { await updateDoc(userRef, fields); Object.assign(profile, fields); return true; }
  catch (e) { console.error(e); toast("Couldn't save. Check your connection and try again."); return false; }
}

/* ---------- start / stop (called by main.js) ---------- */
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
let unsubs = [];

async function loadProfileDoc(ref) {
  for (let i = 0; i < 2; i++) {                      // first read on a fresh tab can fail while Firestore connects
    try { return await withTimeout(getDoc(ref), 10000); }
    catch (e) { if (i === 1 || e?.code === "permission-denied") throw e; await new Promise(r => setTimeout(r, 1200)); }
  }
}

/** Load the user's profile and show the dashboard. Returns false if they haven't registered a pendant yet. */
export async function startApp(user) {
  uid = user.uid; userRef = doc(db, "users", uid);
  const snap = await loadProfileDoc(userRef);
  if (!snap.exists()) return false;
  profile = snap.data();
  unsubs.push(onSnapshot(userRef, s => { if (s.exists()) { profile = s.data(); renderAll(); } }));
  unsubs.push(onSnapshot(query(collection(db, "users", uid, "alerts"), orderBy("at", "desc"), limit(50)), s => {
    alerts = s.docs.map(d => ({ id: d.id, ...d.data(), at: d.data().at?.toMillis?.() ?? Date.now() }));
    renderAll();
  }));
  startLocation();
  if (profile.voice && SpeechRec) startVoice();      // resume listening if Voice Mode was left on
  $("app").hidden = false;
  go(["tracking","guardian","settings","alerts"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "home");
  if (pendingFall) showFallCountdown();
  return true;
}

/** Tear everything down (on sign-out). */
export function stopApp() {
  unsubs.forEach(u => { try { u(); } catch (_) {} }); unsubs = [];
  if (alarmOn) $("tAlarm").click();
  stopVoice();
  if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  stopFallCountdown();
  fallHandled = false; pendingFall = false;
  uid = userRef = profile = null; alerts = []; view = "home";
  $("app").hidden = true;
  history.replaceState(null, "", location.pathname);
}

/* ---------- navigation ---------- */
const titles = { home: null, tracking: ["Live Tracking", "Real-time location sharing"], guardian: ["Guardian Dashboard", "Monitor your loved ones"], settings: ["Settings", "Manage your preferences"], alerts: ["Notifications", null] };
function go(v) {
  view = v;
  history.replaceState(null, "", v === "home" ? location.pathname : "#" + v);
  document.querySelectorAll(".view").forEach(s => (s.hidden = s.dataset.view !== v));
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("act", b.dataset.go === v));
  $("backBtn").hidden = v === "home";
  if (v === "settings") renderSettings();
  if (v === "alerts") markRead();
  renderAll();
  window.scrollTo(0, 0);
}
document.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) { e.preventDefault(); go(b.dataset.go); } });
$("backBtn").onclick = () => go("home");

function renderAll() {
  if (!profile) return;
  renderHeader(); renderHome(); renderTracking(); renderGuardian();
  if (view === "alerts") renderAlerts();
}

const activeSos = () => alerts.find(a => a.type === "sos" && !a.resolved);
function renderHeader() {
  if (!profile) return;
  const t = titles[view];
  $("vTitle").textContent = t ? t[0] : "Hello, " + profile.name.split(/\s+/)[0];
  $("vSub").textContent = view === "alerts" ? `${alerts.length} alert${alerts.length === 1 ? "" : "s"}` : (t ? t[1] : "Your safety dashboard");
  const pill = $("statusPill"), sos = activeSos();
  pill.className = "pill" + (sos ? " red" : "");
  pill.style.background = view === "tracking" && !live ? "#3a3a3a" : "";
  pill.innerHTML = view === "tracking"
    ? '<span style="width:6px;height:6px;border-radius:50%;background:#fff"></span>' + (live ? "Live" : "Paused")
    : ic(sos ? "bell" : "shield") + (sos ? "SOS Active" : "Safe");
  const n = alerts.filter(a => !a.read).length, bd = $("badge");
  bd.hidden = !n; bd.textContent = n;
}

/* ---------- home ---------- */
function setTile(id, on, a, b) { const t = $(id); t.classList.toggle("on", on); t.classList.toggle("off", !on); t.setAttribute("aria-pressed", on); t.querySelector(".s").textContent = on ? a : b; }
function renderHome() {
  if (!profile) return;
  const sos = activeSos();
  $("sosActive").classList.toggle("on", !!sos);
  $("sosNote").hidden = !!sos;
  if (sos) {
    const c = (profile.contacts || []).length;
    $("sosActiveTxt").textContent = c ? `Alert logged for ${c} contact${c > 1 ? "s" : ""} with your location.` : "Add emergency contacts in Settings so someone gets this alert.";
  }
  setTile("tFall", !!profile.autoFall, "On", "Off");
  setTile("tVoice", !!profile.voice, "Listening", "Off");
  $("tVoice").classList.toggle("listening", listening);
  setHidden("voiceLive", !profile.voice || !wantVoice || !!sos);
  setTile("tAlarm", alarmOn, "Sounding", "Off");
  $("devLbl").textContent = profile.deviceId;
}

async function addAlert(a) {
  await addDoc(collection(db, "users", uid, "alerts"), { read: false, resolved: false, lat: pos.lat, lng: pos.lng, at: serverTimestamp(), ...a });
}

/* SOS: press and hold 1.5 s */
const sosBtn = $("sosBtn"); let holdT = null;
function holdStart(e) { if (holdT) return; e?.preventDefault?.(); sosBtn.classList.add("holding"); holdT = setTimeout(fireSos, 1500); }
function holdEnd() { if (!holdT) return; clearTimeout(holdT); holdT = null; sosBtn.classList.remove("holding"); }
sosBtn.addEventListener("pointerdown", holdStart);
["pointerup", "pointerleave", "pointercancel"].forEach(t => sosBtn.addEventListener(t, holdEnd));
sosBtn.addEventListener("keydown", e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) holdStart(e); });
sosBtn.addEventListener("keyup", e => { if (e.key === " " || e.key === "Enter") holdEnd(); });
sosBtn.addEventListener("click", e => e.preventDefault());
async function fireSos(extra = {}) {
  holdT = null; sosBtn.classList.remove("holding");
  if (activeSos()) return toast("SOS is already active");
  try {
    await addAlert({ type: "sos", title: "SOS triggered", msg: profile.sosMessage, source: "button", ...extra });
    navigator.vibrate?.([200, 100, 200]);
    toast("SOS alert sent");
  } catch (e) { console.error(e); toast("Couldn't send SOS. Check your connection."); }
}

function stopFallCountdown() {
  if (fallTimer !== null) { clearInterval(fallTimer); fallTimer = null; }
  const dialog = $("fallDialog");
  if (dialog.open) dialog.close();
}

function cancelFallSos() {
  stopFallCountdown();
  toast("Emergency SOS cancelled");
}

function showFallCountdown() {
  if (!profile || fallTimer !== null || $("fallDialog").open) return;
  pendingFall = false;
  fallSeconds = 5;
  $("fallCountdown").textContent = fallSeconds;
  $("fallDialog").showModal();
  $("cancelFallSos").focus();
  fallTimer = setInterval(() => {
    fallSeconds -= 1;
    $("fallCountdown").textContent = fallSeconds;
    if (fallSeconds <= 0) {
      stopFallCountdown();
      void fireSos({ source: "fall_sensor", title: "SOS triggered after fall detection" });
    }
  }, 1000);
}

document.addEventListener("alerta:fall-detected", () => {
  if (fallHandled) return;
  fallHandled = true;
  if (!profile) { pendingFall = true; return; }
  showFallCountdown();
});
document.addEventListener("alerta:fall-cleared", () => {
  fallHandled = false;
  pendingFall = false;
});
$("cancelFallSos").onclick = cancelFallSos;
$("fallDialog").addEventListener("cancel", event => {
  event.preventDefault();
  cancelFallSos();
});

$("safeBtn").onclick = async () => {
  const s = activeSos(); if (!s) return;
  await updateDoc(doc(db, "users", uid, "alerts", s.id), { resolved: true });
  await addAlert({ type: "safe", title: "Marked safe", msg: "You cancelled the SOS alert.", read: true });
  toast("Marked safe");
};

/* quick tiles */
$("tFall").onclick = async () => { if (await save({ autoFall: !profile.autoFall })) { renderHome(); toast("Fall detection " + (profile.autoFall ? "on" : "off")); } };
$("tVoice").onclick = async () => {
  const turnOn = !profile.voice;
  if (turnOn && !SpeechRec) return toast("Voice mode needs Chrome or Edge. This browser can't listen for speech.");
  if (!(await save({ voice: turnOn }))) return;
  turnOn ? startVoice() : stopVoice();
  renderHome();
  toast(turnOn ? 'Voice mode on. Say "help" to trigger SOS.' : "Voice mode off");
};

/* ---------- voice SOS: listen for "help" / "help pls" / "help please" ---------- */
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const VOICE_COUNTDOWN = 5;                           // seconds to cancel a false alarm; set to 0 to send instantly
const HELP_RE = /\bhelp(\s+me)?(\s+(pls|plz|please))?\b/i;
let rec = null, listening = false, wantVoice = false, countT = null, lastHeard = 0, startedAt = 0, quickEnds = 0;

function startVoice() {
  if (!SpeechRec || listening) return;
  wantVoice = true;
  rec = new SpeechRec();
  rec.lang = "en-IN";
  rec.continuous = true;
  rec.interimResults = true;                         // react while the word is still being spoken
  rec.maxAlternatives = 3;
  rec.onstart = () => { startedAt = Date.now(); if (!listening) { listening = true; renderHome(); } };
  rec.onresult = e => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      for (let a = 0; a < e.results[i].length; a++) {
        const text = e.results[i][a].transcript.trim();
        if (a === 0 && text) setText("voiceLiveTxt", `Heard: "${text.slice(-60)}"`);
        const m = text.match(HELP_RE);
        if (m) return onHelpHeard(m[0]);
      }
    }
  };
  rec.onerror = e => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      wantVoice = false;
      save({ voice: false }); renderHome();
      toast("Microphone is blocked. Allow mic access in the browser's address bar, then turn Voice Mode on again.");
    } else if (e.error === "audio-capture") {
      wantVoice = false; save({ voice: false }); renderHome();
      toast("No microphone found. Plug one in and try again.");
    }
    // "no-speech", "network", "aborted": onend below restarts listening
  };
  rec.onend = () => {                                // Chrome stops after silence or ~1 min; keep it going
    if (!wantVoice) { listening = false; renderHome(); return; }
    const now = Date.now();
    quickEnds = now - startedAt < 3000 ? quickEnds + 1 : 0;   // ended almost immediately?
    if (quickEnds >= 5) {                            // something keeps killing it: stop instead of thrashing
      wantVoice = false; listening = false; quickEnds = 0;
      save({ voice: false }); renderHome();
      return toast("Voice Mode stopped: the microphone keeps disconnecting. Check mic access and try again.");
    }
    const wait = Math.min(300 * 2 ** quickEnds, 5000);
    setTimeout(() => { if (wantVoice) { try { rec.start(); } catch (_) {} } }, wait);
  };
  try { rec.start(); } catch (_) {}
}
function stopVoice() {
  wantVoice = false; listening = false;
  try { rec?.stop(); } catch (_) {}
  rec = null; cancelVoiceCountdown(); renderHome();
}

function onHelpHeard(phrase) {
  if (activeSos() || countT || Date.now() - lastHeard < 8000) return;   // ignore repeats while one is running
  lastHeard = Date.now();
  const extra = { source: "voice", title: "SOS triggered by voice", heard: phrase };
  if (VOICE_COUNTDOWN <= 0) return fireSos(extra);
  let s = VOICE_COUNTDOWN;
  setText("voiceHeard", `Heard "${phrase}". Tap Cancel if you're safe.`);
  setText("voiceSec", s); setText("voiceNum", s);
  if (!$("voiceCount")) { lastHeard = Date.now(); return fireSos(extra); }   // old page without the countdown box
  setHidden("voiceCount", false);
  navigator.vibrate?.([300, 150, 300]);
  countT = setInterval(() => {
    s--;
    setText("voiceSec", s); setText("voiceNum", s);
    if (s <= 0) { cancelVoiceCountdown(); fireSos(extra); }
  }, 1000);
}
function cancelVoiceCountdown() { clearInterval(countT); countT = null; setHidden("voiceCount", true); }
if ($("voiceCancel")) $("voiceCancel").onclick = () => { cancelVoiceCountdown(); toast("Voice SOS cancelled"); };
let alarmOn = false, actx = null, osc = null, lfo = null;
$("tAlarm").onclick = () => {
  alarmOn = !alarmOn;
  try {
    if (alarmOn) {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume?.();
      osc = actx.createOscillator(); lfo = actx.createOscillator();
      const lg = actx.createGain(), gain = actx.createGain();
      osc.type = "square"; osc.frequency.value = 900; lfo.frequency.value = 2.5; lg.gain.value = 350; gain.gain.value = 0.08;
      lfo.connect(lg); lg.connect(osc.frequency); osc.connect(gain); gain.connect(actx.destination); osc.start(); lfo.start();
    } else { osc?.stop(); lfo?.stop(); osc = lfo = null; }
  } catch (_) {}
  renderHome();
};

/* ---------- live location ---------- */
function startLocation() {
  if (!("geolocation" in navigator)) { $("gpsNote").textContent = "This browser can't share location. Showing a sample position."; return; }
  watchId = navigator.geolocation.watchPosition(p => {
    if (!live) return;
    gpsReal = true;
    pos = { lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) };
    $("gpsNote").textContent = `Accurate to about ${Math.round(p.coords.accuracy)} m`;
    renderTracking(); renderGuardian();
    if (Date.now() - lastSaved > 60000) {            // share with guardians at most once a minute
      lastSaved = Date.now();
      updateDoc(userRef, { lastLocation: { ...pos, at: serverTimestamp() } }).catch(() => {});
    }
  }, err => {
    $("gpsNote").textContent = err.code === 1 ? "Location permission is off. Allow it in your browser to share your real position." : "Couldn't get a GPS fix. Showing your last known position.";
  }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 });
}
function renderTracking() { if (!profile) return; $("lat").textContent = pos.lat.toFixed(6); $("lng").textContent = pos.lng.toFixed(6); }
$("pauseBtn").onclick = () => {
  live = !live;
  $("pauseTxt").textContent = live ? "Pause" : "Resume";
  $("pauseIc").innerHTML = ic(live ? "pause" : "play");
  $("shareBanner").classList.toggle("paused", !live);
  $("shareTitle").textContent = live ? "Live Location Sharing Active" : "Location Sharing Paused";
  $("shareSub").textContent = live ? "Your guardians can see your location" : "Guardians see your last known location";
  updateDoc(userRef, { sharing: live }).catch(() => {});
  renderHeader(); toast(live ? "Sharing resumed" : "Sharing paused");
};
$("recenter").onclick = () => navigator.geolocation?.getCurrentPosition(p => {
  pos = { lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) }; renderTracking(); toast("Location updated");
}, () => toast("Couldn't get your location"));

/* ---------- guardian ---------- */
function renderGuardian() {
  if (!profile) return;
  const L = profile.name.trim()[0].toUpperCase();
  $("gAv").textContent = L; $("gPinTxt").textContent = L;
  $("gName").textContent = profile.name; $("gPhone").textContent = profile.phone;
  $("gTime").textContent = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" });
  $("gLoc").textContent = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
  $("gNav").href = `https://www.google.com/maps?q=${pos.lat},${pos.lng}`;
  const c = (profile.contacts || [])[0];
  const num = "+" + digits(c ? c.phone : profile.phone);
  $("gCall").href = "tel:" + num;
  $("gMsg").href = `sms:${num}?body=${encodeURIComponent(profile.sosMessage + " My location: https://www.google.com/maps?q=" + pos.lat + "," + pos.lng)}`;
}

/* ---------- settings ---------- */
let draft = [];
function renderSettings() {
  $("setName").textContent = profile.name; $("setPhone").textContent = profile.phone;
  draft = (profile.contacts || []).map(c => ({ ...c })); drawContacts();
  $("autoFall").setAttribute("aria-checked", !!profile.autoFall);
  $("sosMsg").value = profile.sosMessage || "";
  const u = auth.currentUser;
  $("modeNote").textContent = u?.email ? `Signed in with Google as ${u.email}` : `Signed in with ${u?.phoneNumber || "your phone"}`;
}
function drawContacts() {
  const box = $("contacts"); box.innerHTML = "";
  if (!draft.length) { box.innerHTML = '<div class="empty-c">No emergency contacts yet. Add the people who should get your SOS alerts.</div>'; return; }
  draft.forEach((c, i) => {
    const d = document.createElement("div"); d.className = "contact";
    d.innerHTML = `<div class="r"><input id="cn${i}" placeholder="Name" aria-label="Contact name"><input id="cr${i}" placeholder="Relation" aria-label="Relation"></div><input id="cp${i}" type="tel" placeholder="+91 9876543211" aria-label="Contact phone"><button class="x" aria-label="Remove contact">${ic("x")}</button>`;
    const [n, r, p] = ["cn", "cr", "cp"].map(k => d.querySelector("#" + k + i));
    n.value = c.name || ""; r.value = c.relation || ""; p.value = c.phone || "";
    n.oninput = e => (c.name = e.target.value); r.oninput = e => (c.relation = e.target.value); p.oninput = e => (c.phone = e.target.value);
    d.querySelector(".x").onclick = () => { draft.splice(i, 1); drawContacts(); };
    box.appendChild(d);
  });
}
$("addContact").onclick = () => { if (draft.length >= 5) return toast("You can add up to 5 contacts"); draft.push({ name: "", relation: "", phone: "" }); drawContacts(); $("cn" + (draft.length - 1)).focus(); };
$("saveContacts").onclick = async () => {
  const clean = draft.map(c => ({ name: (c.name || "").trim(), relation: (c.relation || "").trim(), phone: (c.phone || "").trim() })).filter(c => c.name || c.phone);
  if (clean.some(c => digits(c.phone).length < 10)) return toast("Each contact needs a valid phone number");
  if (await save({ contacts: clean })) { toast("Contacts saved"); renderSettings(); }
};
$("autoFall").onclick = async () => { if (await save({ autoFall: !profile.autoFall })) $("autoFall").setAttribute("aria-checked", !!profile.autoFall); };
$("saveMsg").onclick = async () => { const v = $("sosMsg").value.trim(); if (!v) return toast("Write a message first"); if (await save({ sosMessage: v.slice(0, 300) })) toast("Message saved"); };
$("signOut").onclick = async () => {
  stopApp();
  await signOut(auth);                               // main.js sees the sign-out and shows the login form
};

/* ---------- alerts ---------- */
async function markRead() {
  const unread = alerts.filter(a => !a.read);
  if (!unread.length) return;
  const b = writeBatch(db);
  unread.forEach(a => b.update(doc(db, "users", uid, "alerts", a.id), { read: true }));
  b.commit().catch(() => {});
}
function renderAlerts() {
  const list = $("alertList"); list.innerHTML = "";
  if (!alerts.length) {
    list.innerHTML = `<div class="empty"><div class="bell">${ic("bell")}</div><strong>No notifications</strong><span>Your alerts and notifications will appear here</span></div>`;
    return;
  }
  const h = document.createElement("div"); h.style.cssText = "display:flex;justify-content:flex-end";
  h.innerHTML = `<button class="textbtn" style="color:var(--muted)">${ic("x")}Clear all</button>`;
  h.querySelector("button").onclick = () => $("clearConfirm").classList.add("on");
  list.appendChild(h);
  const col = document.createElement("div"); col.style.cssText = "display:flex;flex-direction:column;gap:8px";
  alerts.forEach(a => {
    const el = document.createElement("div");
    el.className = "alert" + (a.type === "safe" ? " ok" : a.type === "fall" ? " fall" : "");
    el.innerHTML = `<div class="ico">${ic(a.type === "safe" ? "check" : "bell")}</div><div class="t"><strong></strong><p></p><p class="mono" style="font-size:11px"></p></div><time></time>`;
    el.querySelector("strong").textContent = a.title + (a.type === "sos" && !a.resolved ? " · active" : "");
    const ps = el.querySelectorAll("p");
    ps[0].textContent = (a.heard ? `Heard "${a.heard}" · ` : "") + (a.msg || "");
    ps[1].textContent = `${(a.lat || 0).toFixed(5)}, ${(a.lng || 0).toFixed(5)}`;
    el.querySelector("time").textContent = new Date(a.at).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    col.appendChild(el);
  });
  list.appendChild(col);
}
$("clearNo").onclick = () => $("clearConfirm").classList.remove("on");
$("clearYes").onclick = async () => {
  $("clearConfirm").classList.remove("on");
  const snap = await getDocs(collection(db, "users", uid, "alerts"));
  const b = writeBatch(db); snap.forEach(d => b.delete(d.ref));
  await b.commit(); toast("Alerts deleted");
};
