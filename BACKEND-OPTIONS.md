# Backend options (you don't have to use Supabase)

Everything in this app talks to the backend through **one file**:
`src/lib/supabase.js`. Swap that file's insides and the rest of the app doesn't
change. That's the whole point — you're not locked in.

The app needs four things:

1. **Phone sign-in** (send a code, verify it)
2. **A place to store** profiles, friendships and beacons
3. **Security rules** so people only see their friends' data
4. **Realtime** so a friend's light appears without a refresh

Here's who does those, honestly.

---

## Firebase (Google) — the strongest alternative

- **Phone auth is built in and excellent.** No Twilio account needed, free tier
  included. This is Firebase's single biggest advantage over Supabase.
- Firestore for data, security rules for access, realtime listeners built in.
- Cloud Messaging is the best push notification system available, and it's free.
- **Trade-offs:** NoSQL, so no SQL queries — you model data differently and
  duplicate more. Costs scale by reads, which can surprise you. Google's
  ecosystem lock-in is real.

**Pick this if** phone auth and push are your priority. For Show Face
specifically, that's a strong argument.

## Convex

- TypeScript functions instead of SQL, realtime by default, genuinely pleasant
  to build in.
- **Trade-off:** auth is bolted on via Clerk or Auth0, smaller company, smaller
  community if you get stuck.

## Appwrite / PocketBase (self-hosted)

- Open source, you own everything, cheap at scale.
- **Trade-off:** you're now running a server. Updates, backups, uptime, and
  scaling are your problem. Not what you want while testing whether anyone taps
  the button.

## Xano / Bubble / Adalo (no-code)

- Build the backend in a visual editor with little code.
- **Trade-offs:** monthly cost from day one, slower, and hard to escape later.
  Fine for a prototype, painful for a real product.

## Skip the backend entirely (for now)

You can ship a **local-only** version: beacons live on the phone, and you share
status through a group text. It proves nothing about whether the social loop
works, but it costs nothing and takes an afternoon. Only worth it if you want
something in hands this week.

## Go straight native (Expo + a backend)

Since contact import and reliable push both require a native app, you'll end up
here eventually. **Expo** works with Firebase or Supabase equally well. The
backend choice doesn't change.

---

## Honest recommendation

**Firebase** is the one I'd switch to, for one concrete reason: phone auth
without Twilio. That removes the setup step most likely to stall you, and the
free tier covers your first users.

**But** you already used Supabase on Traffix. Knowing a tool beats a slightly
better tool. If you're moving fast in the next two weeks, staying on Supabase
and paying a few dollars for Twilio is probably the faster path.

Either way, don't switch twice. Pick one this week and build.

---

## If you want Firebase, the shape is the same

Replace `src/lib/supabase.js` with an equivalent that exports the same
functions:

```js
sendCode(phone)        // signInWithPhoneNumber + reCAPTCHA
verifyCode(phone, code)
getProfile(uid) / saveProfile(uid, fields)
lightBeacon({ place, expires_at })
getMyBeacon(uid) / killMyBeacon(uid)
friendsOut()
onFriendLive(handler)  // onSnapshot listener
```

The `beacons` collection needs the same idea as the SQL table: an `expiresAt`
timestamp, and a query filtering `expiresAt > now`. The expiry logic is
database-agnostic — it's just a timestamp comparison.

Say the word and I'll write the Firebase version of that file.
