# Alerta – Smart Safety System

Web dashboard for the Alerta safety pendant, with real sign-in through **Firebase Authentication**:

- **Sign in with Google**
- **Phone number + SMS OTP**
- New users register their name, phone and pendant **Device ID** (e.g. `ALRT-001`). Each Device ID can belong to only one account.
- Profiles, emergency contacts, SOS message and alerts are stored in **Cloud Firestore**. Security rules let each user see only their own data.

Plain HTML, CSS and JavaScript. No build step and no `npm install`.

```
alerta/
├── index.html            Sign in / sign up / OTP / pendant registration
├── dashboard.html        Home (SOS), Tracking, Guardian, Settings, Alerts
├── css/styles.css
├── js/
│   ├── firebase-config.js   ← paste your Firebase config here
│   ├── firebase.js          Firebase setup + helpers
│   ├── auth.js              Login page logic
│   └── app.js               Dashboard logic (protected: signed-out users are sent to index.html)
├── firestore.rules       Security rules to publish in Firebase
└── vercel.json
```

---

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com → **Add project** → name it `alerta`.
2. **Project settings → General → Your apps → Web (`</>`)**, register the app, then copy the `firebaseConfig` object into `js/firebase-config.js`.

## 2. Turn on the sign-in methods

**Build → Authentication → Get started → Sign-in method**

- **Google** → Enable → choose a support email → Save.
- **Phone** → Enable → Save.
  - **Test without SMS costs:** under *Phone numbers for testing*, add for example `+91 9876543210` with code `123456`. That number then signs in with that code and no SMS is sent.
  - **Real SMS** to any number needs the **Blaze (pay-as-you-go)** plan.

**Authentication → Settings → Authorized domains**: `localhost` is already listed. Add `127.0.0.1` and, after deploying, your Vercel domain (e.g. `alerta.vercel.app`).

## 3. Create Firestore and publish the rules

1. **Build → Firestore Database → Create database** → pick a region (e.g. `asia-south1` Mumbai) → *Start in production mode*.
2. Open the **Rules** tab, replace everything with the contents of `firestore.rules`, and click **Publish**.

## 4. Run it in VS Code

The JavaScript files are ES modules, so open the site through a local server. Opening `index.html` by double-clicking won't work.

1. Open the `alerta` folder in VS Code.
2. Install the **Live Server** extension (Extensions panel → search "Live Server" by Ritwick Dey).
3. Right-click `index.html` → **Open with Live Server** (opens at `http://127.0.0.1:5500`).

Alternative: run `npx serve .` in the terminal and open `http://localhost:3000`.

## 5. Deploy to Vercel

1. Push the folder to a GitHub repo.
2. On https://vercel.com: **Add New → Project** → import the repo. Framework preset is **Other**, with no build command.
3. Add the Vercel URL to Firebase **Authorized domains** (step 2).

Firebase web config values are meant to be public. Your data is protected by the Firestore rules, so `firebase-config.js` is safe to commit.

---

## How sign-in works

| Flow | What happens |
|---|---|
| **Sign up with phone** | Name + phone + Device ID → SMS code → account created → dashboard |
| **Sign in with phone** | Phone → SMS code → dashboard (or the registration step if no profile exists yet) |
| **Google (either mode)** | Google popup → existing users go to the dashboard, new users enter phone + Device ID once |
| **Protected dashboard** | `dashboard.html` checks the Firebase session. Signed-out users, and users who haven't finished registering, go back to `index.html` |
| **Sign out** | Settings → Sign Out ends the Firebase session |

Sessions persist across browser restarts until the user signs out.

## Firestore data

```
users/{uid}               name, phone, deviceId, email, provider, contacts[], sosMessage,
                          autoFall, voice, sharing, lastLocation{lat,lng,at}, createdAt
users/{uid}/alerts/{id}   type (sos | safe | fall), title, msg, lat, lng, at, read, resolved
devices/{deviceId}        owner (uid), claimedAt
```

The ESP32 pendant can write to `users/{uid}/alerts` (for example a `fall` or `sos` alert from the threat model). The dashboard shows each new alert immediately.

The sensor API should return `fallDetected: true` in its latest data to start a 5-second SOS countdown in the open dashboard. The user can cancel before it ends; otherwise, an SOS alert is saved to Firestore. The countdown triggers once per detection and rearms after the API reports `fallDetected: false`. This logs an alert but does not send SMS or WhatsApp messages.

## Not included yet

- **SMS or WhatsApp to emergency contacts on SOS.** The alert is saved to Firestore. Sending messages needs a server-side step, such as a Cloud Function triggered on new `alerts` docs that calls Twilio or MSG91.
- **Guardian accounts that watch someone else's pendant.** The Guardian tab currently shows your own pendant.
