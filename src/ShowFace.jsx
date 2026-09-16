import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Radar, Check, Users, User, ChevronRight, ChevronLeft, Bell, Contact,
  Shield, Share2, LogOut, X, MapPin, Hand, Plus,
} from "lucide-react";
import {
  isConfigured, supabase, sendCode, verifyCode, signOut,
  getProfile, saveProfile, lightBeacon, getMyBeacon, killMyBeacon,
  friendsOut, onFriendLive, BEACON_HOURS,
  respond, unrespond, myCircles, createCircle, lastRecap,
} from "./lib/supabase";
import { TERMS, PRIVACY } from "./legal";

/* ============================================================
   SHOW FACE
   iOS-native feel: system font, grouped lists, sheet modals,
   spring easing, haptics, safe areas.
   ============================================================ */

const CSS = `
*{ box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
html,body,#root{ height:100%; }
body{
  --bg:#F2EFE7; --group:#FFFFFF; --sep:rgba(60,60,67,.12); --sep2:rgba(60,60,67,.29);
  --ink:#141312; --ink2:#3C3C43; --label2:rgba(60,60,67,.6); --label3:rgba(60,60,67,.3);
  --tint:#141312; --fill:#EFEBE2; --danger:#C0392B;
  /* Apple's system stack — renders SF Pro on iPhone, Segoe on Windows */
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,system-ui,sans-serif;
  background:var(--bg); color:var(--ink);
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
  overscroll-behavior-y:none; -webkit-user-select:none; user-select:none;
}
input,textarea{ -webkit-user-select:text; user-select:text; }
button{ font-family:inherit; color:inherit; -webkit-text-fill-color:currentColor; appearance:none; }
.app{ min-height:100dvh; display:flex; flex-direction:column; max-width:520px; margin:0 auto; width:100%;
  padding-top:env(safe-area-inset-top); }
.scroll{ flex:1 1 auto; overflow-y:auto; -webkit-overflow-scrolling:touch;
  padding-bottom:calc(92px + env(safe-area-inset-bottom)); }
.tnum{ font-variant-numeric:tabular-nums; }

/* --- iOS navigation bar + large title --- */
.navbar{ display:flex; align-items:center; justify-content:space-between; height:44px; padding:0 8px; }
.navbtn{ background:none; border:none; color:var(--tint); font-size:17px; display:flex; align-items:center;
  gap:2px; padding:8px 8px; cursor:pointer; border-radius:8px; }
.navbtn:active{ opacity:.4; }
.navtitle{ font-size:17px; font-weight:600; }
.largetitle{ font-size:34px; font-weight:700; letter-spacing:.37px; padding:4px 20px 8px; }
.subtitle{ font-size:15px; color:var(--label2); padding:0 20px 10px; line-height:1.4; }

/* --- iOS grouped inset list --- */
.grouphdr{ font-size:13px; color:var(--label2); text-transform:uppercase; letter-spacing:.06em;
  padding:22px 32px 7px; font-weight:500; }
.group{ background:var(--group); border-radius:14px; margin:0 16px; overflow:hidden; }
.cell{ display:flex; align-items:center; gap:12px; padding:12px 16px; min-height:52px;
  position:relative; background:var(--group); }
.cell + .cell::before{ content:""; position:absolute; left:16px; right:0; top:0; height:.5px; background:var(--sep); }
.cell.tap{ cursor:pointer; } .cell.tap:active{ background:var(--fill); }
.celltext{ flex:1; min-width:0; }
.celltitle{ font-size:17px; letter-spacing:-.4px; }
.cellsub{ font-size:13px; color:var(--label2); margin-top:2px; letter-spacing:-.08px; }
.cellvalue{ font-size:17px; color:var(--label2); }
.chev{ color:var(--label3); flex:0 0 auto; }
.footnote{ font-size:13px; color:var(--label2); padding:7px 32px 0; line-height:1.38; }

.avatar{ width:38px; height:38px; border-radius:50%; flex:0 0 auto; background:var(--fill);
  display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:600;
  position:relative; color:var(--ink); }
.avatar.dark{ background:var(--ink); color:#F2EFE7; }
.avatar .dot{ position:absolute; bottom:-1px; right:-1px; width:12px; height:12px; border-radius:50%;
  background:var(--ink); border:2.5px solid var(--group); }

/* --- the beacon --- */
.stage{ display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:28px 0 8px; min-height:52dvh; }
.beacon{ width:min(72vw,296px); height:min(72vw,296px); border-radius:50%; position:relative;
  background:none; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer;
  color:var(--ink); -webkit-text-fill-color:currentColor; font-family:inherit; appearance:none;
  transition:transform .28s cubic-bezier(.34,1.56,.64,1); }
.beacon:active{ transform:scale(.955); }
.beacon .core{ position:absolute; inset:12%; border-radius:50%; background:var(--group);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px;
  transition:.45s cubic-bezier(.34,1.3,.64,1); box-shadow:0 8px 30px rgba(0,0,0,.08); }
.beacon .ring{ position:absolute; inset:0; border-radius:50%; border:1px solid rgba(20,19,18,.2); opacity:0; }
.idle .ring{ animation:pulse 4s cubic-bezier(.25,.5,.35,1) infinite; }
.idle .r2{ animation-delay:1.33s; } .idle .r3{ animation-delay:2.66s; }
@keyframes pulse{ 0%{ inset:32%; opacity:0 } 15%{ opacity:.38 } 100%{ inset:0; opacity:0 } }
.beacon .label{ font-size:26px; font-weight:600; letter-spacing:-.6px; }
.beacon .meta{ font-size:13px; color:var(--label2); }
.live .core{ inset:9%; background:var(--ink); color:#F2EFE7; box-shadow:0 20px 50px rgba(20,19,18,.3); }
.live .label{ color:#F2EFE7; } .live .meta{ color:rgba(242,239,231,.55); }
.countline{ margin-top:20px; font-size:15px; color:var(--label2); text-align:center; padding:0 28px; }
.countline b{ color:var(--ink); font-weight:600; }

/* --- buttons --- */
.btn{ width:100%; padding:16px; border-radius:14px; border:none; font-size:17px; font-weight:600;
  font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
  letter-spacing:-.4px; transition:transform .12s, opacity .12s; }
.btn:active{ transform:scale(.98); opacity:.85; }
.btn.primary{ background:var(--ink); color:#F2EFE7; }
.btn.secondary{ background:var(--group); color:var(--ink); }
.btn.plain{ background:none; color:var(--tint); font-weight:400; }
.btn.danger{ background:var(--group); color:var(--danger); }
.btn:disabled{ opacity:.35; }
.pad{ padding:18px 16px; }

/* --- onboarding --- */
.ob{ flex:1; display:flex; flex-direction:column; padding:0 24px calc(28px + env(safe-area-inset-bottom)); }
.obtop{ flex:1; display:flex; flex-direction:column; justify-content:center; padding:30px 0; }
.obicon{ width:72px; height:72px; border-radius:20px; background:var(--ink); color:#F2EFE7;
  display:flex; align-items:center; justify-content:center; margin-bottom:26px; }
.obtitle{ font-size:32px; font-weight:700; letter-spacing:-.9px; line-height:1.12; }
.obbody{ font-size:16px; color:var(--ink2); line-height:1.5; margin-top:14px; letter-spacing:-.2px; }
.oblist{ margin-top:22px; display:flex; flex-direction:column; gap:14px; }
.obrow{ display:flex; gap:12px; align-items:flex-start; }
.obrow .ic{ width:26px; height:26px; border-radius:8px; background:var(--fill); flex:0 0 auto;
  display:flex; align-items:center; justify-content:center; margin-top:1px; }
.obrow .t{ font-size:15px; line-height:1.45; color:var(--ink2); }
.obrow .t b{ color:var(--ink); font-weight:600; }
.input{ width:100%; padding:15px 16px; border-radius:12px; border:none; background:var(--group);
  font-size:17px; font-family:inherit; outline:none; margin-bottom:10px; letter-spacing:-.4px; }
.input:focus{ box-shadow:0 0 0 3px rgba(20,19,18,.12); }
.err{ color:var(--danger); font-size:14px; margin-top:10px; }
.dots{ display:flex; gap:6px; justify-content:center; padding:14px 0 4px; }
.dots i{ width:6px; height:6px; border-radius:50%; background:var(--label3); }
.dots i.on{ background:var(--ink); }

/* consent checkbox */
.consent{ display:flex; gap:11px; align-items:flex-start; margin-top:20px; cursor:pointer; }
.box{ width:22px; height:22px; border-radius:6px; border:1.5px solid var(--sep2); flex:0 0 auto;
  display:flex; align-items:center; justify-content:center; margin-top:1px; transition:.15s; }
.box.on{ background:var(--ink); border-color:var(--ink); color:#F2EFE7; }
.consent .ct{ font-size:13.5px; color:var(--ink2); line-height:1.45; }
.link{ color:var(--tint); text-decoration:underline; }

/* --- sheet (iOS modal) --- */
.scrim{ position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:50; display:flex; align-items:flex-end;
  animation:fade .25s ease; }
@keyframes fade{ from{opacity:0} to{opacity:1} }
.sheet{ width:100%; max-width:520px; margin:0 auto; background:var(--bg); border-radius:14px 14px 0 0;
  max-height:92dvh; display:flex; flex-direction:column;
  animation:up .42s cubic-bezier(.32,.72,0,1); padding-bottom:env(safe-area-inset-bottom); }
@keyframes up{ from{ transform:translateY(100%) } to{ transform:translateY(0) } }
.sheethdr{ display:flex; align-items:center; justify-content:space-between; padding:14px 16px 10px; flex:0 0 auto; }
.sheetbody{ overflow-y:auto; padding:0 20px 28px; -webkit-overflow-scrolling:touch; }
.legaltext{ font-size:14.5px; line-height:1.6; color:var(--ink2); white-space:pre-wrap; }
.legaltext h2{ font-size:17px; font-weight:600; color:var(--ink); margin:22px 0 8px; }

/* --- tab bar --- */
.tabbar{ position:fixed; bottom:0; left:0; right:0; max-width:520px; margin:0 auto; display:flex;
  background:rgba(242,239,231,.82); backdrop-filter:saturate(180%) blur(20px);
  -webkit-backdrop-filter:saturate(180%) blur(20px); border-top:.5px solid var(--sep);
  padding:8px 0 calc(6px + env(safe-area-inset-bottom)); z-index:20; }
.tab{ flex:1; background:none; border:none; display:flex; flex-direction:column; align-items:center; gap:3px;
  font-size:10px; font-weight:500; color:var(--label2); cursor:pointer; font-family:inherit; letter-spacing:.06px; }
.tab.on{ color:var(--ink); } .tab:active{ opacity:.5; }
.fieldinput{ flex:1; border:none; background:none; font-family:inherit; font-size:17px;
  letter-spacing:-.4px; color:var(--ink); outline:none; padding:2px 0; min-width:0; }
.fieldinput::placeholder{ color:var(--label3); }
.timefield{ font-variant-numeric:tabular-nums; }
.joins{ display:flex; align-items:center; gap:8px; margin-top:7px; }
.jstack{ display:flex; } .jstack i{ width:20px; height:20px; border-radius:50%; background:var(--fill);
  border:2px solid var(--group); margin-left:-7px; display:flex; align-items:center; justify-content:center;
  font-size:9px; font-weight:700; font-style:normal; color:var(--ink2); }
.jstack i:first-child{ margin-left:0; }
.jtext{ font-size:12.5px; color:var(--label2); }
.respond{ display:flex; gap:7px; flex:0 0 auto; }
.rbtn{ padding:8px 13px; border-radius:20px; border:1px solid var(--sep2); background:var(--group);
  font-size:13px; font-weight:600; color:var(--ink); cursor:pointer; font-family:inherit;
  display:flex; align-items:center; gap:5px; transition:transform .12s; }
.rbtn:active{ transform:scale(.94); }
.rbtn.on{ background:var(--ink); color:#F2EFE7; border-color:var(--ink); }
.rbtn.icon{ padding:8px 10px; }
.grouptag{ display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700;
  text-transform:uppercase; letter-spacing:.04em; background:var(--ink); color:#F2EFE7;
  padding:2px 8px; border-radius:20px; margin-left:7px; }
.audience{ display:flex; gap:8px; overflow-x:auto; padding:0 16px; }
.audience::-webkit-scrollbar{ height:0; }
.achip{ flex:0 0 auto; padding:10px 15px; border-radius:22px; border:1px solid var(--sep2);
  background:var(--group); font-size:14px; font-weight:500; color:var(--ink2); cursor:pointer;
  font-family:inherit; }
.achip.on{ background:var(--ink); color:#F2EFE7; border-color:var(--ink); font-weight:600; }
.recapcard{ background:var(--ink); color:#F2EFE7; border-radius:18px; padding:24px; margin-top:4px; }
.recapcard .rbig{ font-size:27px; font-weight:700; letter-spacing:-.8px; line-height:1.15; }
.recapcard .rsub{ font-size:15px; color:rgba(242,239,231,.65); margin-top:12px; line-height:1.5; }
.nudgecard{ margin:16px; padding:16px 18px; border-radius:14px; background:var(--group);
  display:flex; align-items:center; gap:13px; }
.nudgecard .nt{ font-size:15px; font-weight:600; } .nudgecard .nd{ font-size:13px; color:var(--label2); margin-top:3px; }
.banner{ margin:16px; padding:13px 15px; border-radius:12px; background:var(--group);
  font-size:13px; color:var(--label2); line-height:1.45; }
`;

const initials = (n) => (n || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
const haptic = (ms = 8) => { try { navigator.vibrate?.(ms); } catch {} };
const DEMO = [
  { id: "b1", user_id: "d1", name: "Marcus Bell", place: "The Local",
    started_at: new Date(Date.now() + 18e5).toISOString(), expires_at: new Date(Date.now() + 9e6).toISOString(),
    going: 2, joiners: ["Tasha", "Ben"], my_status: null },
  { id: "b2", user_id: "d2", name: "Priya Raman", place: "Lakeside Café",
    started_at: new Date(Date.now() - 12e5).toISOString(), expires_at: new Date(Date.now() + 5e6).toISOString(),
    going: 0, joiners: [], my_status: null },
  { id: "b3", user_id: "d3", name: "Dev Shah", place: "Berniece Park", circle_name: "Basketball Crew",
    started_at: new Date(Date.now() + 36e5).toISOString(), expires_at: new Date(Date.now() + 15e6).toISOString(),
    going: 4, joiners: ["Sam", "Mia", "Ben", "Ana"], my_status: null },
];
const DEMO_CIRCLES = [{ id: "c1", name: "Friday Night People" }, { id: "c2", name: "Basketball Crew" }];
function timeLeft(e) {
  const ms = new Date(e) - Date.now();
  if (ms <= 0) return "just ended";
  const h = Math.floor(ms / 36e5), m = Math.floor((ms % 36e5) / 6e4);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}
const clock = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
// Before you arrive it counts toward the time; after, it counts down.
function status(b) {
  if (!b) return "";
  const start = b.started_at ? new Date(b.started_at) : null;
  if (start && start > new Date()) return `arriving ${clock(b.started_at)}`;
  return timeLeft(b.expires_at);
}

/* ---------------- legal sheet ---------------- */
function LegalSheet({ doc, onClose }) {
  return (
    <div className="scrim" onClick={e => e.target.classList.contains("scrim") && onClose()}>
      <div className="sheet">
        <div className="sheethdr">
          <span className="navtitle">{doc === "terms" ? "Terms of Service" : "Privacy Policy"}</span>
          <button className="navbtn" onClick={onClose}><X size={22} /></button>
        </div>
        <div className="sheetbody"><div className="legaltext">{doc === "terms" ? TERMS : PRIVACY}</div></div>
      </div>
    </div>
  );
}

/* ---------------- recap: shown once your light goes out ---------------- */
function Recap({ data, onClose, onAgain }) {
  const hrs = Math.max(1, Math.round((new Date(data.expires_at) - new Date(data.started_at)) / 36e5));
  const names = (data.joiners || []).filter(Boolean);
  return (
    <div className="scrim" onClick={e => e.target.classList.contains("scrim") && onClose()}>
      <div className="sheet">
        <div className="sheethdr">
          <span />
          <span className="navtitle">Your light went out</span>
          <button className="navbtn" onClick={onClose}><X size={22} /></button>
        </div>
        <div className="sheetbody">
          <div className="recapcard">
            <div className="rbig">
              {names.length > 0
                ? `${names.length === 1 ? names[0] : `${names.length} people`} came out with you.`
                : "You showed face."}
            </div>
            <div className="rsub">
              {data.place ? `${data.place} · ` : ""}{hrs} {hrs === 1 ? "hour" : "hours"}
              {names.length > 0 && <><br />{names.join(", ")}</>}
            </div>
          </div>
          <div style={{ padding: "22px 0 8px" }}>
            <button className="btn primary" onClick={onAgain}>Do it again</button>
            <button className="btn plain" style={{ marginTop: 4 }} onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- going out: type when you'll be there ---------------- */
function GoingOut({ onGo, onClose, circles }) {
  const [circle, setCircle] = useState(null);
  const [place, setPlace] = useState("");
  const [time, setTime] = useState("");      // "HH:MM" — when you'll arrive
  const [err, setErr] = useState("");

  // Turn a typed clock time into a real timestamp.
  // If that time already passed today, they mean later tonight.
  const resolve = () => {
    if (!time) return null;
    const [h, m] = time.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return "bad";
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d <= new Date()) d.setDate(d.getDate() + 1);
    if (d - Date.now() > 24 * 36e5) return "bad";
    return d.toISOString();
  };

  const go = () => {
    const arriving = resolve();
    if (arriving === "bad") { setErr("That time doesn't look right."); return; }
    onGo({ place: place.trim(), arriving, circle });
  };

  const arriving = resolve();
  const clock = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const who = circle ? `${circle.name} is` : "you're";
  const preview = arriving && arriving !== "bad"
    ? `Friends see ${who} heading${place.trim() ? ` to ${place.trim()}` : " out"} at ${clock(arriving)}`
    : `Friends see ${who} out now${place.trim() ? ` at ${place.trim()}` : ""}`;

  return (
    <div className="scrim" onClick={e => e.target.classList.contains("scrim") && onClose()}>
      <div className="sheet">
        <div className="sheethdr">
          <button className="navbtn" onClick={onClose}>Cancel</button>
          <span className="navtitle">Show your face</span>
          <button className="navbtn" style={{ fontWeight: 600 }} onClick={go}>Go</button>
        </div>
        <div className="sheetbody">
          {circles?.length > 0 && <>
            <div className="grouphdr" style={{ padding: "8px 16px 7px" }}>Who's going out</div>
            <div className="audience">
              <button className={`achip ${!circle ? "on" : ""}`} onClick={() => { haptic(); setCircle(null); }}>Just me</button>
              {circles.map(c => (
                <button key={c.id} className={`achip ${circle?.id === c.id ? "on" : ""}`}
                  onClick={() => { haptic(); setCircle(c); }}>{c.name}</button>
              ))}
            </div>
            <div className="footnote" style={{ padding: "8px 16px 0" }}>
              A group light says the whole crew is out — harder to ignore than one person.
            </div>
          </>}
          <div className="grouphdr" style={{ padding: "22px 16px 7px" }}>Where (optional)</div>
          <div className="group" style={{ margin: 0 }}>
            <div className="cell">
              <MapPin size={18} style={{ color: "var(--label2)" }} />
              <input className="fieldinput" placeholder="The Local, the gym, the park…"
                value={place} onChange={e => setPlace(e.target.value)} maxLength={60} />
            </div>
          </div>

          <div className="grouphdr" style={{ padding: "22px 16px 7px" }}>Getting there at</div>
          <div className="group" style={{ margin: 0 }}>
            <div className="cell">
              <input className="fieldinput timefield" type="time" value={time}
                onChange={e => { setErr(""); setTime(e.target.value); }} />
              {time
                ? <button className="navbtn" style={{ padding: 4 }} onClick={() => setTime("")}><X size={18} /></button>
                : <span className="cellvalue">Now</span>}
            </div>
          </div>
          <div className="footnote" style={{ padding: "8px 16px 0" }}>
            Type when you'll be there. Leave it blank if you're already out.
          </div>
          {err && <div className="err" style={{ padding: "0 16px" }}>{err}</div>}

          <div style={{ padding: "26px 0 8px" }}>
            <button className="btn primary" onClick={go}><Radar size={19} /> Turn my light on</button>
            <div className="footnote" style={{ textAlign: "center", padding: "12px 0 0" }}>{preview}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- onboarding ---------------- */
function Onboarding({ onDone, onDemo }) {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [legal, setLegal] = useState(null);
  const [perms, setPerms] = useState({ notif: false, contacts: false });

  const next = () => { haptic(); setStep(s => s + 1); };

  const send = async () => {
    setBusy(true); setErr("");
    try { await sendCode(phone.trim()); haptic(); setStep(2); }
    catch (e) { setErr(e.message || "Couldn't send that code."); }
    finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true); setErr("");
    try { await verifyCode(phone.trim(), code.trim()); haptic(12); setStep(3); }
    catch (e) { setErr(e.message || "That code didn't work."); }
    finally { setBusy(false); }
  };

  const askNotifications = async () => {
    haptic();
    try {
      if ("Notification" in window) {
        const r = await Notification.requestPermission();
        setPerms(p => ({ ...p, notif: r === "granted" }));
      }
    } catch {}
    setStep(4);
  };

  const askContacts = async () => {
    haptic();
    // Contact Picker API — Chrome/Android only. Safari has none, by design.
    try {
      if ("contacts" in navigator && "ContactsManager" in window) {
        const picked = await navigator.contacts.select(["tel"], { multiple: true });
        setPerms(p => ({ ...p, contacts: picked.length > 0 }));
      }
    } catch {}
    finish(true);
  };

  const finish = (contactsAllowed = false) => {
    haptic(12);
    onDone({ ...perms, contacts: contactsAllowed, agreedAt: new Date().toISOString() });
  };

  return (
    <div className="app">
      {legal && <LegalSheet doc={legal} onClose={() => setLegal(null)} />}
      <div className="ob">
        {step > 0 && step < 3 && (
          <div className="navbar" style={{ padding: 0 }}>
            <button className="navbtn" onClick={() => setStep(s => s - 1)}><ChevronLeft size={24} /> Back</button>
          </div>
        )}

        {step === 0 && (
          <>
            <div className="obtop">
              <div className="obicon"><Radar size={34} /></div>
              <div className="obtitle">Show Face</div>
              <div className="obbody">
                One tap tells your people you're out. It turns itself off after {BEACON_HOURS} hours.
              </div>
              <div className="oblist">
                <div className="obrow"><div className="ic"><Radar size={14} /></div>
                  <div className="t"><b>Tap once.</b> Your friends see you're around — no planning, no group chat.</div></div>
                <div className="obrow"><div className="ic"><Users size={14} /></div>
                  <div className="t"><b>Only your people.</b> Nobody outside your friends can see you.</div></div>
                <div className="obrow"><div className="ic"><Shield size={14} /></div>
                  <div className="t"><b>It expires.</b> Your light goes out on its own. No background tracking, ever.</div></div>
              </div>
            </div>
            <button className="btn primary" onClick={next}>Get started</button>
            {onDemo && <button className="btn plain" style={{ marginTop: 6 }} onClick={onDemo}>Look around first</button>}
          </>
        )}

        {step === 1 && (
          <>
            <div className="obtop">
              <div className="obtitle">What's your number?</div>
              <div className="obbody">We'll text you a code. Your number is how friends find you — we never show it publicly.</div>
              <div style={{ marginTop: 26 }}>
                <input className="input" type="tel" inputMode="tel" autoComplete="tel"
                  placeholder="+1 (555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <label className="consent" onClick={() => { haptic(); setAgree(a => !a); }}>
                <span className={`box ${agree ? "on" : ""}`}>{agree && <Check size={14} strokeWidth={3} />}</span>
                <span className="ct">
                  I'm 13 or older and I agree to the{" "}
                  <span className="link" onClick={e => { e.stopPropagation(); setLegal("terms"); }}>Terms of Service</span>
                  {" "}and{" "}
                  <span className="link" onClick={e => { e.stopPropagation(); setLegal("privacy"); }}>Privacy Policy</span>.
                </span>
              </label>
              {err && <div className="err">{err}</div>}
            </div>
            <button className="btn primary" disabled={!agree || phone.replace(/\D/g, "").length < 8 || busy} onClick={send}>
              {busy ? "Sending…" : "Send code"}
            </button>
            <div className="footnote" style={{ textAlign: "center", padding: "12px 0 0" }}>
              Message and data rates may apply.
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="obtop">
              <div className="obtitle">Enter the code</div>
              <div className="obbody">We sent a 6-digit code to {phone}.</div>
              <div style={{ marginTop: 26 }}>
                <input className="input" type="text" inputMode="numeric" autoComplete="one-time-code"
                  placeholder="123456" value={code} onChange={e => setCode(e.target.value)}
                  style={{ fontSize: 24, letterSpacing: 6, textAlign: "center" }} />
              </div>
              {err && <div className="err">{err}</div>}
            </div>
            <button className="btn primary" disabled={code.length < 4 || busy} onClick={verify}>
              {busy ? "Checking…" : "Continue"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="obtop">
              <div className="obicon"><Bell size={32} /></div>
              <div className="obtitle">Know when your friends are out</div>
              <div className="obbody">
                We'll send you a notification when someone in your circle turns their light on.
                That's the only thing we notify you about — no marketing, no daily nudges.
              </div>
              <div className="footnote" style={{ padding: "18px 0 0" }}>
                You can change this any time in Settings.
              </div>
            </div>
            <button className="btn primary" onClick={askNotifications}>Allow notifications</button>
            <button className="btn plain" style={{ marginTop: 6 }} onClick={() => setStep(4)}>Not now</button>
          </>
        )}

        {step === 4 && (
          <>
            <div className="obtop">
              <div className="obicon"><Contact size={32} /></div>
              <div className="obtitle">Find friends already here</div>
              <div className="obbody">
                Show Face only works with your people on it. We can check which of your contacts already use it.
              </div>
              <div className="oblist">
                <div className="obrow"><div className="ic"><Check size={14} /></div>
                  <div className="t">We match <b>scrambled phone numbers only</b> — not names, not emails.</div></div>
                <div className="obrow"><div className="ic"><Check size={14} /></div>
                  <div className="t">We <b>never message your contacts.</b> Invites only go out when you send them.</div></div>
                <div className="obrow"><div className="ic"><Check size={14} /></div>
                  <div className="t">We <b>never sell or share</b> contact data. Turn it off and we delete it.</div></div>
              </div>
              <div className="footnote" style={{ padding: "16px 0 0" }}>
                Your contacts haven't agreed to our terms, so only turn this on if you're comfortable with that.
                Details in the{" "}
                <span className="link" onClick={() => setLegal("privacy")}>Privacy Policy</span>.
              </div>
            </div>
            <button className="btn primary" onClick={askContacts}>Allow contact matching</button>
            <button className="btn plain" style={{ marginTop: 6 }} onClick={() => finish(false)}>Skip — I'll invite manually</button>
          </>
        )}

        <div className="dots">{[0, 1, 2, 3, 4].map(i => <i key={i} className={i === step ? "on" : ""} />)}</div>
      </div>
    </div>
  );
}

/* ---------------- main app ---------------- */
export default function ShowFace() {
  const [session, setSession] = useState(null);
  const [onboarded, setOnboarded] = useState(false);
  const [demo, setDemo] = useState(false);
  const [tab, setTab] = useState("out");
  const [profile, setProfile] = useState(null);
  const [beacon, setBeacon] = useState(null);
  const [out, setOut] = useState([]);
  const [legal, setLegal] = useState(null);
  const [composer, setComposer] = useState(false);
  const [circles, setCircles] = useState([]);
  const [recap, setRecap] = useState(null);
  const [nudge, setNudge] = useState(true);
  const [perms, setPerms] = useState({ notif: false, contacts: false });
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);
  const notified = useRef(new Set());

  useEffect(() => { const t = setInterval(() => tick(n => n + 1), 30000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (data.session) setOnboarded(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const [p, b, f, c] = await Promise.all([
        getProfile(session.user.id), getMyBeacon(session.user.id), friendsOut(), myCircles(),
      ]);
      setProfile(p); setBeacon(b); setOut(f); setCircles(c);
    } catch (e) { console.error(e); }
  }, [session]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (demo) { setOut(DEMO); setCircles(DEMO_CIRCLES); } }, [demo]);

  useEffect(() => {
    if (!session) return;
    return onFriendLive(async (row) => {
      await refresh();
      if (perms.notif && row.user_id !== session.user.id && !notified.current.has(row.id)) {
        notified.current.add(row.id);
        try { new Notification("Someone's out", { body: "A friend just turned their light on.", icon: "icon-192.png" }); } catch {}
      }
    });
  }, [session, refresh, perms.notif]);

  const endAndRecap = useCallback(async (b) => {
    setBeacon(null);
    if (demo) { setRecap({ ...b, joiners: [], going: 0 }); return; }
    try { const r = await lastRecap(); if (r) setRecap(r); } catch (e) { console.error(e); }
  }, [demo]);

  useEffect(() => {
    if (!beacon) return;
    const ms = new Date(beacon.expires_at) - Date.now();
    if (ms <= 0) { endAndRecap(beacon); return; }
    const t = setTimeout(() => endAndRecap(beacon), Math.min(ms, 2 ** 31 - 1));
    return () => clearTimeout(t);
  }, [beacon, endAndRecap]);

  const completeOnboarding = async (p) => {
    setPerms(p); setOnboarded(true);
    if (session) {
      try {
        await saveProfile(session.user.id, {
          accepted_terms_at: p.agreedAt,
          notif_opt_in: p.notif,
          contacts_opt_in: p.contacts,
        });
      } catch (e) { console.error(e); }
    }
  };

  const tapBeacon = async () => {
    haptic(14);
    if (beacon) {                       // already out — tap ends it
      if (demo) { setBeacon(null); return; }
      setBusy(true);
      try { await killMyBeacon(session.user.id); setBeacon(null); }
      catch (e) { console.error(e); } finally { setBusy(false); }
      return;
    }
    setComposer(true);                  // not out — ask when and where
  };

  const goOut = async ({ place, arriving, circle }) => {
    haptic(14);
    setComposer(false);
    const start = arriving || new Date().toISOString();
    // the light stays on for BEACON_HOURS after you get there
    const expires = new Date(new Date(start).getTime() + BEACON_HOURS * 36e5).toISOString();
    if (demo) { setBeacon({ id: "demo", started_at: start, expires_at: expires, place, circle_name: circle?.name }); return; }
    setBusy(true);
    try {
      setBeacon(await lightBeacon({ place: place || null, started_at: start, expires_at: expires, circle_id: circle?.id || null }));
    } catch (e) { console.error(e); } finally { setBusy(false); }
  };

  const reply = async (f, status) => {
    haptic(12);
    const mine = f.my_status === status;
    if (demo) {
      setOut(l => l.map(x => x.user_id === f.user_id
        ? { ...x, my_status: mine ? null : status, going: (x.going || 0) + (mine ? -1 : (status === "in" ? 1 : 0)) }
        : x));
      return;
    }
    try { mine ? await unrespond(f.id) : await respond(f.id, status); await refresh(); }
    catch (e) { console.error(e); }
  };

  const invite = async () => {
    haptic();
    const url = window.location.origin + window.location.pathname;
    const text = "Get on Show Face so you can see when I'm out.";
    if (navigator.share) { try { await navigator.share({ title: "Show Face", text, url }); return; } catch {} }
    try { await navigator.clipboard.writeText(url); alert("Invite link copied."); } catch {}
  };

  if (!onboarded && !demo) {
    return (<><style>{CSS}</style>
      <Onboarding onDone={completeOnboarding} onDemo={isConfigured ? () => setDemo(true) : () => setDemo(true)} /></>);
  }

  const list = out;
  const name = profile?.name || (demo ? "You" : session?.user?.phone || "You");
  const liveCount = list.length + (beacon ? 1 : 0);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {legal && <LegalSheet doc={legal} onClose={() => setLegal(null)} />}
        {composer && <GoingOut onGo={goOut} onClose={() => setComposer(false)}
          circles={demo ? DEMO_CIRCLES : circles} />}
        {recap && <Recap data={recap} onClose={() => setRecap(null)}
          onAgain={() => { setRecap(null); setComposer(true); }} />}

        {tab === "out" && (
          <div className="scroll">
            <div className="navbar"><span /><button className="navbtn" onClick={() => setTab("you")}>
              <span className="avatar dark">{initials(name)}</span></button></div>
            <div className="stage">
              <button className={`beacon ${beacon ? "live" : "idle"}`} onClick={tapBeacon} disabled={busy}>
                {!beacon && <><span className="ring r1" /><span className="ring r2" /><span className="ring r3" /></>}
                <div className="core">
                  {beacon ? <Check size={32} strokeWidth={2.2} /> : <Radar size={32} />}
                  <span className="label">{beacon ? (beacon.started_at && new Date(beacon.started_at) > new Date() ? "On your way" : "You're out") : "Show Face"}</span>
                  <span className="meta">{beacon ? status(beacon) : "one tap"}</span>
                  {beacon?.place && <span className="meta" style={{ marginTop: -4 }}>{beacon.place}</span>}
                </div>
              </button>
              <div className="countline">
                {liveCount > 0
                  ? <><b className="tnum">{liveCount}</b> {liveCount === 1 ? "person is" : "people are"} out right now</>
                  : "Nobody's out yet. Be the first."}
              </div>
            </div>

            {list.length > 0 && <>
              <div className="grouphdr">Out now</div>
              <div className="group">
                {list.map(f => (
                  <div className="cell" key={f.id || f.user_id}>
                    <span className="avatar">{initials(f.circle_name || f.name)}<span className="dot" /></span>
                    <div className="celltext">
                      <div className="celltitle">
                        {f.circle_name || f.name || "Friend"}
                        {f.circle_name && <span className="grouptag"><Users size={9} /> Crew</span>}
                      </div>
                      <div className="cellsub">
                        {f.circle_name ? `${f.name} · ` : ""}{f.place ? `${f.place} · ` : ""}{status(f)}
                      </div>
                      {f.going > 0 && (
                        <div className="joins">
                          <div className="jstack">
                            {(f.joiners || []).slice(0, 3).map((j, i) => <i key={i}>{(j || "?")[0]}</i>)}
                          </div>
                          <span className="jtext">
                            <b className="tnum">{f.going}</b> {f.going === 1 ? "person is" : "people are"} in
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="respond">
                      <button className={`rbtn icon ${f.my_status === "maybe" ? "on" : ""}`}
                        onClick={() => reply(f, "maybe")} title="Maybe"><Hand size={15} /></button>
                      <button className={`rbtn ${f.my_status === "in" ? "on" : ""}`}
                        onClick={() => reply(f, "in")}>
                        {f.my_status === "in" ? <><Check size={14} strokeWidth={3} /> In</> : "I'm in"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>}
            {!beacon && list.length === 0 && (
              <div className="nudgecard">
                <span className="avatar dark"><Bell size={17} /></span>
                <div style={{ flex: 1 }}>
                  <div className="nt">It's quiet right now</div>
                  <div className="nd">Your crew is usually out around 8. Be the first light on.</div>
                </div>
              </div>
            )}
            {demo && <div className="banner">Demo mode — nothing here is real and nothing saves.</div>}
          </div>
        )}

        {tab === "friends" && (
          <div className="scroll">
            <div className="navbar"><span /><span /></div>
            <div className="largetitle">Friends</div>
            <div className="subtitle">Show Face only works with your people on it.</div>
            <div className="grouphdr">Grow your circle</div>
            <div className="group">
              <div className="cell tap" onClick={invite}>
                <span className="avatar dark"><Share2 size={17} /></span>
                <div className="celltext"><div className="celltitle">Invite friends</div>
                  <div className="cellsub">Send your link to people you actually go out with</div></div>
                <ChevronRight size={18} className="chev" />
              </div>
            </div>
            <div className="footnote">We never text your contacts for you. Invites only go out when you send them.</div>
          </div>
        )}

        {tab === "you" && (
          <div className="scroll">
            <div className="navbar"><span /><span /></div>
            <div className="largetitle">You</div>
            <div className="group" style={{ marginTop: 8 }}>
              <div className="cell">
                <span className="avatar dark" style={{ width: 52, height: 52, fontSize: 19 }}>{initials(name)}</span>
                <div className="celltext"><div className="celltitle" style={{ fontWeight: 600 }}>{name}</div>
                  <div className="cellsub">{demo ? "Demo mode" : session?.user?.phone}</div></div>
              </div>
            </div>

            <div className="grouphdr">Privacy</div>
            <div className="group">
              <div className="cell"><span className="celltext">
                <div className="celltitle">Notifications</div>
                <div className="cellsub">When a friend goes out</div></span>
                <span className="cellvalue">{perms.notif ? "On" : "Off"}</span></div>
              <div className="cell"><span className="celltext">
                <div className="celltitle">Contact matching</div>
                <div className="cellsub">Find friends already here</div></span>
                <span className="cellvalue">{perms.contacts ? "On" : "Off"}</span></div>
              <div className="cell"><span className="celltext">
                <div className="celltitle">Location</div>
                <div className="cellsub">Only while your light is on</div></span>
                <span className="cellvalue">Beacon only</span></div>
              <div className="cell tap" onClick={() => { haptic(); setNudge(n => !n); }}>
                <span className="celltext">
                  <div className="celltitle">Daily nudge</div>
                  <div className="cellsub">One reminder at 5pm on your usual nights</div></span>
                <span className="cellvalue">{nudge ? "On" : "Off"}</span></div>
            </div>
            <div className="footnote">We never track you in the background. Your beacon expires by itself after {BEACON_HOURS} hours.</div>

            <div className="grouphdr">About</div>
            <div className="group">
              <div className="cell tap" onClick={() => setLegal("terms")}>
                <div className="celltext"><div className="celltitle">Terms of Service</div></div>
                <ChevronRight size={18} className="chev" /></div>
              <div className="cell tap" onClick={() => setLegal("privacy")}>
                <div className="celltext"><div className="celltitle">Privacy Policy</div></div>
                <ChevronRight size={18} className="chev" /></div>
            </div>

            <div className="pad">
              {!demo && <button className="btn danger" onClick={signOut}><LogOut size={17} /> Sign out</button>}
              {demo && <button className="btn secondary" onClick={() => { setDemo(false); setOnboarded(false); }}>Exit demo</button>}
            </div>
          </div>
        )}

        <div className="tabbar">
          <button className={`tab ${tab === "out" ? "on" : ""}`} onClick={() => { haptic(); setTab("out"); }}><Radar size={24} />Out</button>
          <button className={`tab ${tab === "friends" ? "on" : ""}`} onClick={() => { haptic(); setTab("friends"); }}><Users size={24} />Friends</button>
          <button className={`tab ${tab === "you" ? "on" : ""}`} onClick={() => { haptic(); setTab("you"); }}><User size={24} />You</button>
        </div>
      </div>
    </>
  );
}
