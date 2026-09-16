# Show Face — setup

Do these in order. Each step works on its own, so you can stop anywhere and
still have a working app.

---

## Step 1 — Create the Supabase project

1. Go to **supabase.com** → sign in → **New project**
2. Name it `showface`, pick a region near you, set a database password (save it)
3. Wait ~2 minutes for it to finish setting up

## Step 2 — Create the tables

1. In Supabase, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `supabase/schema.sql` from this project, copy the whole thing, paste it in
4. Click **Run**

You should see "Success." Click **Table Editor** and you'll see `profiles`,
`friendships`, and `beacons`.

## Step 3 — Get your keys into the app

1. In Supabase: **Project Settings** → **API**
2. Copy the **Project URL** and the **anon public** key
3. In this project, make a file called `.env` (copy `.env.example`) and fill it in:

```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

4. Restart `npm run dev`

The anon key is safe in a front-end app — row-level security in the schema is
what actually protects the data. Never put the `service_role` key here.

## Step 4 — Turn on phone sign-in

Supabase doesn't send SMS itself; it uses a provider. **Twilio** is the usual one.

1. Make a **Twilio** account → buy a phone number → create a **Verify Service**
2. In Supabase: **Authentication** → **Providers** → **Phone** → enable
3. Paste your Twilio Account SID, Auth Token, and Message Service SID
4. Test it with your own number first

**This costs money** — roughly a cent or two per SMS, plus ~$1/mo for the number.
Budget for it before you invite a crowd.

*Cheaper for testing:* leave phone auth off and use **Authentication → Providers
→ Email** with magic links. Free, and it proves the whole flow works. Switch to
phone before real users.

## Step 5 — Deploy with your keys

GitHub Pages builds the app, so the keys have to be available at build time.

1. In your repo: **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** → name `VITE_SUPABASE_URL`, paste the value
3. Again → name `VITE_SUPABASE_ANON_KEY`, paste the value
4. In `.github/workflows/deploy.yml`, change the build step to:

```yaml
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

Commit, and the live site will be wired to your database.

---

## Making it feel like an app on your phone

The app is already sized to the real screen — full height, safe areas for the
notch, no fake phone frame. To get it off the browser and onto the home screen:

**iPhone:** open the link in Safari → Share button → **Add to Home Screen**
**Android:** open in Chrome → menu → **Install app**

It then launches full-screen with no browser bar, its own icon, and its own
app switcher entry. That's a PWA — it looks and feels native without the App
Store.

---

## Push notifications — read this before you build it

"Notify me when a friend goes live" is the feature that makes the app worth
opening. It's also the hardest thing on the list. Honestly:

- **On iPhone, web push only works if the user installed the app to their home
  screen** (iOS 16.4+). If they just visit the link, they get nothing.
- It needs a service worker, VAPID keys, a `push_subscriptions` table, and a
  Supabase **Edge Function** that fires on a new beacon row.
- Delivery is less reliable than native push.

**The honest sequence:** ship the beacon + friends with no notifications, see
whether people tap it, and use in-app realtime (already wired via
`onFriendLive`) plus a group text to cover the gap. If it sticks, move to a
real native app with **Expo** — you get proper push and, importantly, contact
import.

## Contact import — the same caveat

There is no way to read a phone's contacts from a website. Safari has no
Contacts API at all. So for now, growth is **invite links** (already in the app:
the Invite button uses the native share sheet).

Real contact import requires a native app. That's the strongest argument for
moving to Expo/React Native once the beacon proves itself.

---

## What's in this version

- **Beacon** — one tap, 4-hour expiry, clears itself, no manual off switch needed
- **Who's out** — your accepted friends with live beacons, updating in realtime
- **Phone sign-in** — SMS code via Supabase
- **Invite** — native share sheet
- Demo mode when no keys are set, so the app still runs for showing people

Everything else — meetups, circles, moments, Plus — is parked. The old full
prototype is still here as `src/ShowFaceDemo.jsx` if you want any of it back.
