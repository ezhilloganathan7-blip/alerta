import {
  auth, db, configMissing, getProfile, toE164, validPhone, normDevice, validDevice,
  GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  RecaptchaVerifier, signInWithPhoneNumber, signOut,
  doc, runTransaction, serverTimestamp
} from "./firebase.js";

const $ = id => document.getElementById(id);
const panels = { form: $("formPanel"), otp: $("otpPanel"), profile: $("profilePanel") };
function show(name) { Object.entries(panels).forEach(([k, el]) => (el.hidden = k !== name)); }
function setErr(id, msg) { const e = $(id); e.textContent = msg || ""; e.classList.toggle("on", !!msg); }
function busy(btn, on) { btn.disabled = on; btn.classList.toggle("loading", on); }

let signupMode = false;
let pending = null;          // details typed on the sign-up form, used once the phone is verified
let confirmation = null;     // Firebase phone ConfirmationResult
let resendTimer = null;

/* ---------- friendly error text ---------- */
function explain(err) {
  const code = err?.code || err?.message || "";
  console.warn("Alerta sign-in error:", code, err);
  const map = {
    "auth/invalid-phone-number": "That phone number isn't valid. Include the country code, e.g. +91 9876543210.",
    "auth/missing-phone-number": "Enter your phone number.",
    "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
    "auth/quota-exceeded": "SMS limit reached for today. Try Google sign-in or come back later.",
    "auth/invalid-verification-code": "That code is wrong. Check the SMS and try again.",
    "auth/code-expired": "That code has expired. Tap Resend code.",
    "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
    "auth/cancelled-popup-request": "Google sign-in was closed before it finished.",
    "auth/unauthorized-domain": "This domain isn't allowed yet. Add it in Firebase → Authentication → Settings → Authorized domains.",
    "auth/operation-not-allowed": "This sign-in method is turned off. Enable it in Firebase → Authentication → Sign-in method.",
    "auth/billing-not-enabled": "Real SMS needs the Firebase Blaze plan. Use a test phone number or Google sign-in for now.",
    "auth/captcha-check-failed": "Security check failed. Reload the page and try again.",
    "auth/invalid-app-credential": "Firebase rejected the security check. Open the site at http://localhost:5500 instead of 127.0.0.1, and make sure localhost is in Authorized domains.",
    "auth/missing-app-credential": "Firebase rejected the security check. Reload the page and try again.",
    "auth/admin-restricted-operation": "New sign-ups are blocked in Firebase. Check Authentication → Settings → User actions.",
    "auth/invalid-api-key": "The apiKey in js/firebase-config.js is wrong. Copy it again from Firebase project settings.",
    "auth/network-request-failed": "No connection. Check your internet and try again.",
    "auth/account-exists-with-different-credential": "This email already uses a different sign-in method.",
    "device-taken": "That Device ID is already registered to another account.",
    "permission-denied": "Firestore blocked the request. Publish the rules from firestore.rules."
  };
  for (const k in map) if (code.includes(k)) return map[k];
  console.error(err);
  return "Something went wrong. Please try again.";
}

/* ---------- mode switch ---------- */
function setMode(up) {
  signupMode = up;
  $("authTitle").textContent = up ? "Create account" : "Welcome back";
  $("authSub").textContent = up ? "Register your pendant to start protecting yourself" : "Sign in to access your safety dashboard";
  $("googleTxt").textContent = up ? "Sign up with Google" : "Continue with Google";
  $("nameField").hidden = !up;
  $("deviceField").hidden = !up;
  $("swTxt").textContent = up ? "Already have an account?" : "Need an account?";
  $("swBtn").textContent = up ? "Sign in" : "Sign up";
  setErr("formErr");
}
$("swBtn").onclick = () => setMode(!signupMode);
if (location.hash === "#signup") setMode(true);

/* ---------- reCAPTCHA (required by Firebase phone auth) ---------- */
// Each attempt gets a brand-new element: reCAPTCHA refuses to render twice in the same one.
let verifier = null;
function getVerifier() {
  if (!verifier) {
    const host = $("recaptcha");
    host.innerHTML = "";
    const box = document.createElement("div");
    host.appendChild(box);
    verifier = new RecaptchaVerifier(auth, box, { size: "invisible" });
  }
  return verifier;
}
function resetVerifier() { try { verifier?.clear(); } catch (_) {} verifier = null; $("recaptcha").innerHTML = ""; }

/* ---------- phone: send OTP ---------- */
async function sendOtp(phone) {
  confirmation = await signInWithPhoneNumber(auth, phone, getVerifier());
  $("otpTo").textContent = phone;
  $("fOtp").value = "";
  setErr("otpErr");
  show("otp");
  $("fOtp").focus();
  startResendCountdown();
}
function startResendCountdown() {
  const btn = $("otpResend"); let s = 30;
  btn.disabled = true; clearInterval(resendTimer);
  btn.textContent = `Resend code (${s}s)`;
  resendTimer = setInterval(() => {
    s--; btn.textContent = s > 0 ? `Resend code (${s}s)` : "Resend code";
    if (s <= 0) { clearInterval(resendTimer); btn.disabled = false; }
  }, 1000);
}

$("formPanel").addEventListener("submit", async e => {
  e.preventDefault(); setErr("formErr");
  if (configMissing) return setErr("formErr", "Add your Firebase config in js/firebase-config.js first.");
  const phone = toE164($("fPhone").value);
  if (!validPhone(phone)) return setErr("formErr", "Enter a valid phone number, e.g. +91 9876543210.");
  if (signupMode) {
    const name = $("fName").value.trim(), deviceId = normDevice($("fDevice").value);
    if (!name) return setErr("formErr", "Enter your name.");
    if (!validDevice(deviceId)) return setErr("formErr", "Device ID should look like ALRT-001.");
    pending = { name, phone, deviceId };
  } else pending = null;

  const btn = $("sendBtn"); busy(btn, true);
  try { await sendOtp(phone); }
  catch (err) { resetVerifier(); setErr("formErr", explain(err)); }
  finally { busy(btn, false); }
});

$("otpPanel").addEventListener("submit", async e => {
  e.preventDefault(); setErr("otpErr");
  const code = $("fOtp").value.replace(/\D/g, "");
  if (code.length !== 6) return setErr("otpErr", "Enter the 6-digit code.");
  const btn = $("verifyBtn"); busy(btn, true);
  try {
    const cred = await confirmation.confirm(code);
    await afterSignIn(cred.user);
  } catch (err) { setErr("otpErr", explain(err)); }
  finally { busy(btn, false); }
});
$("otpBack").onclick = () => { clearInterval(resendTimer); resetVerifier(); show("form"); };
$("otpResend").onclick = async () => {
  setErr("otpErr"); resetVerifier();
  try { await sendOtp($("otpTo").textContent); } catch (err) { setErr("otpErr", explain(err)); }
};

/* ---------- Google ---------- */
$("googleBtn").onclick = async () => {
  setErr("formErr");
  if (configMissing) return setErr("formErr", "Add your Firebase config in js/firebase-config.js first.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const btn = $("googleBtn"); busy(btn, true);
  try {
    const cred = await signInWithPopup(auth, provider);
    await afterSignIn(cred.user);
  } catch (err) {
    if (err?.code === "auth/popup-blocked") { await signInWithRedirect(auth, provider); return; }
    setErr("formErr", explain(err));
  } finally { busy(btn, false); }
};

/* ---------- after any sign-in: go to dashboard or finish profile ---------- */
async function afterSignIn(user) {
  let profile;
  try { profile = await getProfile(user.uid); }
  catch (err) { setErr("formErr", explain(err)); return show("form"); }
  if (profile) return goDashboard();
  if (pending) {                       // came from the sign-up form with everything filled in
    try { await createProfile(user, pending); return goDashboard(); }
    catch (err) { prefillProfile(user); setErr("profileErr", explain(err)); return show("profile"); }
  }
  prefillProfile(user);
  show("profile");
}
function prefillProfile(user) {
  $("pName").value = pending?.name || user.displayName || "";
  $("pDevice").value = pending?.deviceId || "";
  const verifiedPhone = user.phoneNumber;
  $("pPhone").value = verifiedPhone || pending?.phone || "";
  $("pPhone").readOnly = !!verifiedPhone;
}

async function createProfile(user, { name, phone, deviceId }) {
  const userRef = doc(db, "users", user.uid);
  const devRef = doc(db, "devices", deviceId);
  await runTransaction(db, async tx => {
    const dev = await tx.get(devRef);
    if (dev.exists() && dev.data().owner !== user.uid) throw new Error("device-taken");
    tx.set(devRef, { owner: user.uid, claimedAt: serverTimestamp() });
    tx.set(userRef, {
      name, phone, deviceId,
      email: user.email || null,
      provider: user.providerData[0]?.providerId || "phone",
      contacts: [],
      sosMessage: "I need help! This is an emergency.",
      autoFall: true,
      voice: false,
      createdAt: serverTimestamp()
    });
  });
}

$("profilePanel").addEventListener("submit", async e => {
  e.preventDefault(); setErr("profileErr");
  const user = auth.currentUser;
  if (!user) return show("form");
  const name = $("pName").value.trim();
  const phone = toE164($("pPhone").value);
  const deviceId = normDevice($("pDevice").value);
  if (!name) return setErr("profileErr", "Enter your name.");
  if (!validPhone(phone)) return setErr("profileErr", "Enter a valid phone number, e.g. +91 9876543210.");
  if (!validDevice(deviceId)) return setErr("profileErr", "Device ID should look like ALRT-001.");
  const btn = $("profileBtn"); busy(btn, true);
  try { await createProfile(user, { name, phone, deviceId }); goDashboard(); }
  catch (err) { setErr("profileErr", explain(err)); }
  finally { busy(btn, false); }
});
$("profileOut").onclick = async () => { pending = null; resetVerifier(); await signOut(auth); show("form"); };

// main.js owns what's on screen; auth.js just tells it when someone is signed in and registered.
function goDashboard() { document.dispatchEvent(new Event("alerta:enter")); }

// main.js asks for these screens
document.addEventListener("alerta:show-auth", () => {
  pending = null; resetVerifier(); clearInterval(resendTimer);
  $("formPanel").reset(); setMode(location.hash === "#signup"); show("form");
  if (configMissing) setErr("formErr", "Add your Firebase config in js/firebase-config.js, then reload.");
});
document.addEventListener("alerta:need-profile", () => {
  if (auth.currentUser) prefillProfile(auth.currentUser);
  show("profile");
});

/* ---------- on load: finish a Google redirect sign-in, if one is pending ---------- */
if (configMissing) setErr("formErr", "Add your Firebase config in js/firebase-config.js, then reload.");
else getRedirectResult(auth).then(r => { if (r?.user) afterSignIn(r.user); }).catch(err => setErr("formErr", explain(err)));
