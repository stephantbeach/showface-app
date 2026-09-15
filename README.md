# Show Face

A one-tap presence app. Tell your circle you're out, see what's already
happening nearby (run club, yoga, gym, recovery, pickleball, hoops), join it,
or host your own.

React + Vite. The entire UI lives in `src/ShowFace.jsx`.

## Run it locally

Requires [Node.js](https://nodejs.org) v18+.

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Put it online (free, no backend needed)

This is a front-end-only app, so GitHub Pages hosts it for free.

1. Push this project to a GitHub repo named `showface-app`.
2. In the repo go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it. Every push to `main` rebuilds and redeploys automatically
(see `.github/workflows/deploy.yml`). Your live link will be:

```
https://<your-username>.github.io/showface-app/
```

## Edit it

Everything is in **`src/ShowFace.jsx`**:

- **Mock data** — the `const` blocks near the top (`MEETUPS`, `KINDS`,
  `CIRCLES`, `SEED`). Change these to change what appears in the app.
- **Styles** — the `CSS` template string at the top. Colors are the
  `--bg / --ink / --cream / --muted` variables in the `.sf{ ... }` block.
- **Screens** — `Tonight`, `Nearby`, `Circles`, `You` inside the component.
- **Interactions** — the `useState` hooks and handlers (`sendShowFace`,
  `toggleMeetup`, `createMeetup`, `saveProfile`).

## No backend — what that means

This is a **prototype**. All data lives in React state:

- Nothing is saved. Refresh the page and it resets.
- Every visitor sees the same mock friends and meetups.
- Nobody can actually sign up, log in, or see each other.

That's fine for demos, investor meetings, and testing the design. To make it
real you need a backend for: accounts/login, storing meetups and RSVPs,
friend relationships, location, and push notifications.

**Recommended next step: [Supabase](https://supabase.com)** — free tier,
gives you auth + a Postgres database + realtime in one, and works directly
from a React front end with no server to run.
