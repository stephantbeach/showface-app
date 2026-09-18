import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Radar, Check, Users, User, ChevronRight, ChevronLeft, Bell, Contact, Shield, Share2, LogOut, X,
  MapPin, Clock, Navigation, Hand, Plus, Pencil, UserPlus, Megaphone,
} from "lucide-react";
import {
  isConfigured, supabase, sendCode, verifyCode, signOut, getProfile, saveProfile,
  lightBeacon, getMyBeacon, killMyBeacon, friendsOut, onFriendLive, BEACON_HOURS,
  respond, unrespond, myCircles, lastRecap,
  findByPhone, requestFriend, acceptFriend, removeFriend, myRequests, myFriends, myPending,
} from "./lib/supabase";
import { TERMS, PRIVACY } from "./legal";

/* ============================================================
   SHOW FACE
   Tap once to tell your people you're out. That's it.
   ============================================================ */

const CSS = `
*{ box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
html,body,#root{ height:100%; }
body{
  --bg:#F3F0E8; --group:#FFFFFF; --sep:rgba(60,60,67,.12); --sep2:rgba(60,60,67,.29);
  --ink:#141312; --ink2:#3C3C43; --label2:rgba(60,60,67,.6); --label3:rgba(60,60,67,.3);
  --tint:#141312; --fill:#EFEBE2; --danger:#C0392B; --cream:#F3F0E8;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,system-ui,sans-serif;
  background:var(--bg); color:var(--ink); -webkit-font-smoothing:antialiased;
  overscroll-behavior:none; -webkit-user-select:none; user-select:none;
}
input,textarea{ -webkit-user-select:text; user-select:text; }
button{ font-family:inherit; color:inherit; -webkit-text-fill-color:currentColor; appearance:none; }
.app{ min-height:100dvh; display:flex; flex-direction:column; max-width:520px; margin:0 auto; width:100%;
  padding-top:env(safe-area-inset-top); }
.scroll{ flex:1 1 auto; overflow-y:auto; -webkit-overflow-scrolling:touch; padding-bottom:calc(92px + env(safe-area-inset-bottom)); }
.tnum{ font-variant-numeric:tabular-nums; }

.navbar{ display:flex; align-items:center; justify-content:space-between; height:44px; padding:0 8px; }
.navbtn{ background:none; border:none; color:var(--tint); font-size:17px; display:flex; align-items:center; gap:2px; padding:8px; cursor:pointer; }
.navbtn:active{ opacity:.4; }
.navtitle{ font-size:17px; font-weight:600; }
.largetitle{ font-size:34px; font-weight:700; letter-spacing:.37px; padding:4px 20px 8px; }
.subtitle{ font-size:15px; color:var(--label2); padding:0 20px 10px; line-height:1.4; }
.grouphdr{ font-size:13px; color:var(--label2); text-transform:uppercase; letter-spacing:.06em; padding:22px 32px 7px; font-weight:500; }
.group{ background:var(--group); border-radius:14px; margin:0 16px; overflow:hidden; }
.cell{ display:flex; align-items:center; gap:12px; padding:12px 16px; min-height:52px; position:relative; background:var(--group); }
.cell + .cell::before{ content:""; position:absolute; left:16px; right:0; top:0; height:.5px; background:var(--sep); }
.cell.tap{ cursor:pointer; } .cell.tap:active{ background:var(--fill); }
.celltext{ flex:1; min-width:0; } .celltitle{ font-size:17px; letter-spacing:-.4px; }
.cellsub{ font-size:13px; color:var(--label2); margin-top:2px; } .cellvalue{ font-size:17px; color:var(--label2); }
.chev{ color:var(--label3); flex:0 0 auto; }
.footnote{ font-size:13px; color:var(--label2); padding:7px 32px 0; line-height:1.38; }
.avatar{ width:38px; height:38px; border-radius:50%; flex:0 0 auto; background:var(--fill); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:600; color:var(--ink); position:relative; }
.avatar.dark{ background:var(--ink); color:var(--cream); }
.avatar .dot{ position:absolute; bottom:-1px; right:-1px; width:12px; height:12px; border-radius:50%; background:var(--ink); border:2.5px solid var(--group); }
.pf{ width:38px; height:38px; border-radius:50%; background:var(--ink); color:var(--cream); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:13px; font-weight:600; }

/* the beacon */
.stage{ display:flex; flex-direction:column; align-items:center; justify-content:center; padding:36px 0 10px; min-height:50dvh; }
.beacon{ width:min(70vw,280px); height:min(70vw,280px); border-radius:50%; position:relative; background:none; border:none;
  display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--ink);
  transition:transform .28s cubic-bezier(.34,1.56,.64,1); }
.beacon:active{ transform:scale(.955); }
.beacon .core{ position:absolute; inset:12%; border-radius:50%; background:var(--group); display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:8px; transition:.45s cubic-bezier(.34,1.3,.64,1); box-shadow:0 8px 30px rgba(0,0,0,.08); }
.beacon .ring{ position:absolute; inset:0; border-radius:50%; border:1px solid rgba(20,19,18,.2); opacity:0; }
.idle .ring{ animation:pulse 4s cubic-bezier(.25,.5,.35,1) infinite; }
.idle .r2{ animation-delay:1.33s; } .idle .r3{ animation-delay:2.66s; }
@keyframes pulse{ 0%{ inset:32%; opacity:0 } 15%{ opacity:.38 } 100%{ inset:0; opacity:0 } }
.beacon .label{ font-size:26px; font-weight:600; letter-spacing:-.6px; }
.beacon .meta{ font-size:13px; color:var(--label2); }
.live .core{ inset:9%; background:var(--ink); color:var(--cream); box-shadow:0 20px 50px rgba(20,19,18,.3); }
.live .label{ color:var(--cream); } .live .meta{ color:rgba(243,240,232,.55); }
.countline{ margin-top:18px; font-size:15px; color:var(--label2); text-align:center; padding:0 28px; }
.countline b{ color:var(--ink); font-weight:600; }
.rallybtn{ margin-top:14px; background:none; border:none; font-size:14px; font-weight:600; color:var(--label2); display:flex; align-items:center; gap:7px; cursor:pointer; padding:8px 12px; }

.livecard{ margin:0 16px; background:var(--ink); color:var(--cream); border-radius:18px; padding:16px 18px; }
.livecard .ttl{ font-weight:600; font-size:15.5px; display:flex; align-items:center; gap:9px; }
.livedot{ width:9px; height:9px; border-radius:50%; background:var(--cream); }
.livecard .mt{ color:rgba(243,240,232,.7); font-size:13px; margin-top:8px; line-height:1.55; } .livecard .mt b{ color:var(--cream); font-weight:600; }
.livecard .acts{ display:flex; gap:8px; margin-top:14px; }
.lbtn{ font-size:12.5px; font-weight:600; color:var(--cream); background:rgba(255,255,255,.12); border:none; border-radius:30px; padding:9px 14px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; }

.joins{ display:flex; align-items:center; gap:8px; margin-top:7px; }
.jstack{ display:flex; } .jstack i{ width:20px; height:20px; border-radius:50%; background:var(--fill); border:2px solid var(--group); margin-left:-7px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; font-style:normal; color:var(--ink2); }
.jstack i:first-child{ margin-left:0; } .jtext{ font-size:12.5px; color:var(--label2); }
.respond{ display:flex; gap:7px; flex:0 0 auto; }
.rbtn{ padding:8px 13px; border-radius:20px; border:1px solid var(--sep2); background:var(--group); font-size:13px; font-weight:600; color:var(--ink); cursor:pointer; display:flex; align-items:center; gap:5px; }
.rbtn:active{ transform:scale(.94); } .rbtn.on{ background:var(--ink); color:var(--cream); border-color:var(--ink); } .rbtn.icon{ padding:8px 10px; }
.grouptag{ display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; background:var(--ink); color:var(--cream); padding:2px 8px; border-radius:20px; margin-left:7px; }
.empty{ margin:0 16px; padding:26px 20px; text-align:center; background:var(--group); border-radius:14px; color:var(--label2); font-size:14.5px; line-height:1.5; }

.btn{ width:100%; padding:16px; border-radius:14px; border:none; font-size:17px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; letter-spacing:-.4px; transition:transform .12s, opacity .12s; }
.btn:active{ transform:scale(.98); opacity:.85; }
.btn.primary{ background:var(--ink); color:var(--cream); } .btn.secondary{ background:var(--group); color:var(--ink); }
.btn.plain{ background:none; color:var(--tint); font-weight:400; } .btn.danger{ background:var(--group); color:var(--danger); }
.btn:disabled{ opacity:.35; } .pad{ padding:18px 16px; }
.smallbtn{ padding:9px 14px; border-radius:20px; border:none; background:var(--ink); color:var(--cream); font-size:13px; font-weight:600; cursor:pointer; flex:0 0 auto; }
.smallbtn.ghost{ background:var(--fill); color:var(--ink); }

/* onboarding */
.ob{ flex:1; display:flex; flex-direction:column; padding:0 24px calc(28px + env(safe-area-inset-bottom)); }
.obtop{ flex:1; display:flex; flex-direction:column; justify-content:center; padding:30px 0; }
.obicon{ width:72px; height:72px; border-radius:20px; background:var(--ink); color:var(--cream); display:flex; align-items:center; justify-content:center; margin-bottom:26px; }
.obtitle{ font-size:32px; font-weight:700; letter-spacing:-.9px; line-height:1.12; }
.obbody{ font-size:16px; color:var(--ink2); line-height:1.5; margin-top:14px; }
.oblist{ margin-top:22px; display:flex; flex-direction:column; gap:14px; }
.obrow{ display:flex; gap:12px; align-items:flex-start; }
.obrow .ic{ width:26px; height:26px; border-radius:8px; background:var(--fill); flex:0 0 auto; display:flex; align-items:center; justify-content:center; margin-top:1px; }
.obrow .t{ font-size:15px; line-height:1.45; color:var(--ink2); } .obrow .t b{ color:var(--ink); font-weight:600; }
.input{ width:100%; padding:15px 16px; border-radius:12px; border:none; background:var(--group); font-size:17px; font-family:inherit; outline:none; margin-bottom:10px; letter-spacing:-.4px; }
.input:focus{ box-shadow:0 0 0 3px rgba(20,19,18,.12); }
.err{ color:var(--danger); font-size:14px; margin-top:10px; }
.ok{ color:#2F7D4F; font-size:14px; margin-top:10px; }
.dots{ display:flex; gap:6px; justify-content:center; padding:14px 0 4px; } .dots i{ width:6px; height:6px; border-radius:50%; background:var(--label3); } .dots i.on{ background:var(--ink); }
.consent{ display:flex; gap:11px; align-items:flex-start; margin-top:20px; cursor:pointer; }
.box{ width:22px; height:22px; border-radius:6px; border:1.5px solid var(--sep2); flex:0 0 auto; display:flex; align-items:center; justify-content:center; margin-top:1px; }
.box.on{ background:var(--ink); border-color:var(--ink); color:var(--cream); }
.consent .ct{ font-size:13.5px; color:var(--ink2); line-height:1.45; } .link{ color:var(--tint); text-decoration:underline; }

/* sheets */
.scrim{ position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:50; display:flex; align-items:flex-end; animation:fade .25s ease; }
@keyframes fade{ from{opacity:0} to{opacity:1} }
.sheet{ width:100%; max-width:520px; margin:0 auto; background:var(--bg); border-radius:14px 14px 0 0; max-height:92dvh; display:flex; flex-direction:column; animation:up .42s cubic-bezier(.32,.72,0,1); padding-bottom:env(safe-area-inset-bottom); }
@keyframes up{ from{ transform:translateY(100%) } to{ transform:none } }
.sheethdr{ display:flex; align-items:center; justify-content:space-between; padding:14px 16px 10px; flex:0 0 auto; }
.sheetbody{ overflow-y:auto; padding:0 20px 28px; }
.legaltext{ font-size:14.5px; line-height:1.6; color:var(--ink2); white-space:pre-wrap; }
.fieldinput{ flex:1; border:none; background:none; font-family:inherit; font-size:17px; letter-spacing:-.4px; color:var(--ink); outline:none; padding:2px 0; min-width:0; }
.fieldinput::placeholder{ color:var(--label3); }
.audience{ display:flex; gap:8px; overflow-x:auto; padding:0 16px; } .audience::-webkit-scrollbar{ height:0; }
.achip{ flex:0 0 auto; padding:10px 15px; border-radius:22px; border:1px solid var(--sep2); background:var(--group); font-size:14px; font-weight:500; color:var(--ink2); cursor:pointer; }
.achip.on{ background:var(--ink); color:var(--cream); border-color:var(--ink); font-weight:600; }
.recapcard{ background:var(--ink); color:var(--cream); border-radius:18px; padding:24px; margin-top:4px; }
.recapcard .rbig{ font-size:27px; font-weight:700; letter-spacing:-.8px; line-height:1.15; }
.recapcard .rsub{ font-size:15px; color:rgba(243,240,232,.65); margin-top:12px; line-height:1.5; }
.sw{ width:51px; height:31px; border-radius:31px; background:rgba(120,120,128,.32); position:relative; cursor:pointer; transition:.2s; flex:0 0 auto; }
.sw.on{ background:var(--ink); }
.sw::after{ content:""; position:absolute; top:2px; left:2px; width:27px; height:27px; border-radius:50%; background:#fff; box-shadow:0 3px 8px rgba(0,0,0,.15); transition:.2s cubic-bezier(.34,1.3,.64,1); }
.sw.on::after{ left:22px; }

.tabbar{ position:fixed; bottom:0; left:0; right:0; max-width:520px; margin:0 auto; display:flex; background:rgba(243,240,232,.88);
  backdrop-filter:saturate(180%) blur(20px); -webkit-backdrop-filter:saturate(180%) blur(20px); border-top:.5px solid var(--sep);
  padding:8px 0 calc(6px + env(safe-area-inset-bottom)); z-index:20; }
.tab{ flex:1; background:none; border:none; display:flex; flex-direction:column; align-items:center; gap:3px; font-size:10px; font-weight:500; color:var(--label2); cursor:pointer; position:relative; }
.tab.on{ color:var(--ink); }
.tab .badge{ position:absolute; top:-2px; right:calc(50% - 20px); min-width:16px; height:16px; border-radius:8px; background:var(--danger); color:#fff; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; padding:0 4px; }
.banner{ margin:16px; padding:13px 15px; border-radius:12px; background:var(--group); font-size:13px; color:var(--label2); line-height:1.45; }
`;

const initials = (n) => (n || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
const haptic = (ms = 8) => { try { navigator.vibrate?.(ms); } catch {} };
const clock = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
function timeLeft(e) {
  const ms = new Date(e) - Date.now(); if (ms <= 0) return "just ended";
  const h = Math.floor(ms / 36e5), m = Math.floor((ms % 36e5) / 6e4);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}
function status(b) {
  if (!b) return "";
  if (b.started_at && new Date(b.started_at) > new Date()) return `arriving ${clock(b.started_at)}`;
  return timeLeft(b.expires_at);
}
const DEMO = [
  { id: "b1", user_id: "d1", name: "Marcus Bell", place: "The Local", started_at: new Date(Date.now() + 18e5).toISOString(), expires_at: new Date(Date.now() + 9e6).toISOString(), going: 2, joiners: ["Tasha", "Ben"], my_status: null },
  { id: "b2", user_id: "d2", name: "Priya Raman", place: "Lakeside Café", started_at: new Date(Date.now() - 12e5).toISOString(), expires_at: new Date(Date.now() + 5e6).toISOString(), going: 0, joiners: [], my_status: null },
  { id: "b3", user_id: "d3", name: "Dev Shah", place: "Berniece Park", circle_name: "Basketball Crew", started_at: new Date(Date.now() + 36e5).toISOString(), expires_at: new Date(Date.now() + 15e6).toISOString(), going: 4, joiners: ["Sam", "Mia", "Ben", "Ana"], my_status: null },
];
const DEMO_CIRCLES = [{ id: "c1", name: "Friday Night People" }, { id: "c2", name: "Basketball Crew" }];
const DEMO_FRIENDS = [{ id: "d1", name: "Marcus Bell" }, { id: "d2", name: "Priya Raman" }, { id: "d3", name: "Dev Shah" }];

/* ---------------- sheets ---------------- */
function LegalSheet({ doc, onClose }) {
  return (
    <div className="scrim" onClick={e => e.target.classList.contains("scrim") && onClose()}>
      <div className="sheet">
        <div className="sheethdr"><span className="navtitle">{doc === "terms" ? "Terms of Service" : "Privacy Policy"}</span><button className="navbtn" onClick={onClose}><X size={22} /></button></div>
        <div className="sheetbody"><div className="legaltext">{doc === "terms" ? TERMS : PRIVACY}</div></div>
      </div>
    </div>
  );
}

function GoingOut({ onGo, onClose, circles, rally }) {
  const [circle, setCircle] = useState(null); const [place, setPlace] = useState(""); const [time, setTime] = useState(""); const [err, setErr] = useState("");
  const resolve = () => {
    if (!time) return null;
    const [h, m] = time.split(":").map(Number); if (Number.isNaN(h) || Number.isNaN(m)) return "bad";
    const d = new Date(); d.setHours(h, m, 0, 0); if (d <= new Date()) d.setDate(d.getDate() + 1);
    if (d - Date.now() > 24 * 36e5) return "bad"; return d.toISOString();
  };
  const go = () => { const a = resolve(); if (a === "bad") { setErr("That time doesn't look right."); return; } onGo({ place: place.trim(), arriving: a, circle, rally }); };
  const a = resolve(); const who = circle ? `${circle.name} is` : "you're";
  const preview = a && a !== "bad" ? `Friends see ${who} heading${place.trim() ? ` to ${place.trim()}` : " out"} at ${clock(a)}` : `Friends see ${who} out now${place.trim() ? ` at ${place.trim()}` : ""}`;
  return (
    <div className="scrim" onClick={e => e.target.classList.contains("scrim") && onClose()}>
      <div className="sheet">
        <div className="sheethdr"><button className="navbtn" onClick={onClose}>Cancel</button><span className="navtitle">{rally ? "Rally your people" : "Show your face"}</span><button className="navbtn" style={{ fontWeight: 600 }} onClick={go}>Go</button></div>
        <div className="sheetbody">
          {circles?.length > 0 && <>
            <div className="grouphdr" style={{ padding: "8px 16px 7px" }}>Who's going out</div>
            <div className="audience">
              <button className={`achip ${!circle ? "on" : ""}`} onClick={() => { haptic(); setCircle(null); }}>Just me</button>
              {circles.map(c => <button key={c.id} className={`achip ${circle?.id === c.id ? "on" : ""}`} onClick={() => { haptic(); setCircle(c); }}>{c.name}</button>)}
            </div>
          </>}
          <div className="grouphdr" style={{ padding: "22px 16px 7px" }}>Where (optional)</div>
          <div className="group" style={{ margin: 0 }}><div className="cell"><MapPin size={18} style={{ color: "var(--label2)" }} /><input className="fieldinput" placeholder="The Local, the gym, the park…" value={place} onChange={e => setPlace(e.target.value)} maxLength={60} /></div></div>
          <div className="grouphdr" style={{ padding: "22px 16px 7px" }}>Getting there at</div>
          <div className="group" style={{ margin: 0 }}><div className="cell"><input className="fieldinput tnum" type="time" value={time} onChange={e => { setErr(""); setTime(e.target.value); }} />{time ? <button className="navbtn" style={{ padding: 4 }} onClick={() => setTime("")}><X size={18} /></button> : <span className="cellvalue">Now</span>}</div></div>
          <div className="footnote" style={{ padding: "8px 16px 0" }}>Type when you'll be there. Leave it blank if you're already out.</div>
          {err && <div className="err" style={{ padding: "0 16px" }}>{err}</div>}
          <div style={{ padding: "26px 0 8px" }}>
            <button className="btn primary" onClick={go}>{rally ? <><Megaphone size={19} /> Send the rally</> : <><Radar size={19} /> Turn my light on</>}</button>
            <div className="footnote" style={{ textAlign: "center", padding: "12px 0 0" }}>{preview}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Recap({ data, onClose, onAgain }) {
  const hrs = Math.max(1, Math.round((new Date(data.expires_at) - new Date(data.started_at)) / 36e5));
  const names = (data.joiners || []).filter(Boolean);
  return (
    <div className="scrim" onClick={e => e.target.classList.contains("scrim") && onClose()}>
      <div className="sheet">
        <div className="sheethdr"><span /><span className="navtitle">Your light went out</span><button className="navbtn" onClick={onClose}><X size={22} /></button></div>
        <div className="sheetbody">
          <div className="recapcard">
            <div className="rbig">{names.length > 0 ? `${names.length === 1 ? names[0] : `${names.length} people`} came out with you.` : "You showed face."}</div>
            <div className="rsub">{data.place ? `${data.place} · ` : ""}{hrs} {hrs === 1 ? "hour" : "hours"}{names.length > 0 && <><br />{names.join(", ")}</>}</div>
          </div>
          <div style={{ padding: "22px 0 8px" }}><button className="btn primary" onClick={onAgain}>Do it again</button><button className="btn plain" style={{ marginTop: 4 }} onClick={onClose}>Done</button></div>
        </div>
      </div>
    </div>
  );
}

function AddFriend({ demo, onClose, onAdded }) {
  const [phone, setPhone] = useState(""); const [found, setFound] = useState(null); const [msg, setMsg] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const search = async () => {
    setBusy(true); setErr(""); setMsg(""); setFound(null);
    try {
      if (demo) { setFound({ id: "x", name: "Demo Friend" }); return; }
      const r = await findByPhone(phone); if (!r) setErr("Nobody on Show Face with that number yet."); else setFound(r);
    } catch (e) { setErr(e.message || "Couldn't search."); } finally { setBusy(false); }
  };
  const send = async () => {
    setBusy(true); setErr("");
    try {
      const r = demo ? "sent" : await requestFriend(found.id);
      setMsg(r === "accepted" ? `You and ${found.name || "they"} are now friends.` : `Request sent to ${found.name || "them"}.`);
      onAdded();
    } catch (e) { setErr(e.message || "Couldn't send."); } finally { setBusy(false); }
  };
  const invite = async () => {
    const url = window.location.origin + window.location.pathname;
    if (navigator.share) { try { await navigator.share({ title: "Show Face", text: "Get on Show Face so you can see when I'm out.", url }); return; } catch {} }
    try { await navigator.clipboard.writeText(url); setMsg("Invite link copied."); } catch {}
  };
  return (
    <div className="scrim" onClick={e => e.target.classList.contains("scrim") && onClose()}>
      <div className="sheet">
        <div className="sheethdr"><button className="navbtn" onClick={onClose}>Cancel</button><span className="navtitle">Add a friend</span><span style={{ width: 60 }} /></div>
        <div className="sheetbody">
          <div className="grouphdr" style={{ padding: "8px 16px 7px" }}>Their phone number</div>
          <div className="group" style={{ margin: 0 }}><div className="cell"><input className="fieldinput" type="tel" inputMode="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)} /><button className="smallbtn" disabled={busy || phone.replace(/\D/g, "").length < 10} onClick={search}>Find</button></div></div>
          <div className="footnote" style={{ padding: "8px 16px 0" }}>They need to already have Show Face. We never show anyone's number.</div>
          {found && !msg && (
            <div className="group" style={{ margin: "18px 0 0" }}>
              <div className="cell"><span className="avatar">{initials(found.name)}</span><div className="celltext"><div className="celltitle">{found.name || "Someone"}</div><div className="cellsub">On Show Face</div></div><button className="smallbtn" disabled={busy} onClick={send}><UserPlus size={14} style={{ verticalAlign: -2 }} /> Add</button></div>
            </div>
          )}
          {msg && <div className="ok" style={{ padding: "0 16px" }}>{msg}</div>}
          {err && <div className="err" style={{ padding: "0 16px" }}>{err}</div>}
          <div style={{ padding: "28px 0 6px" }}><div className="footnote" style={{ padding: "0 0 10px", textAlign: "center" }}>Not on it yet?</div><button className="btn secondary" onClick={invite}><Share2 size={17} /> Send an invite link</button></div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- onboarding ---------------- */
function Onboarding({ onDone, onDemo, session }) {
  const [step, setStep] = useState(session ? 3 : 0);
  const [phone, setPhone] = useState(""); const [code, setCode] = useState(""); const [name, setName] = useState("");
  const [agree, setAgree] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [legal, setLegal] = useState(null);
  const perms = useRef({ notif: false, contacts: false });
  const next = () => { haptic(); setStep(s => s + 1); };
  const send = async () => { setBusy(true); setErr(""); try { await sendCode(phone.trim()); setStep(2); } catch (e) { setErr(e.message || "Couldn't send that code."); } finally { setBusy(false); } };
  const verify = async () => { setBusy(true); setErr(""); try { await verifyCode(phone.trim(), code.trim()); setStep(3); } catch (e) { setErr(e.message || "That code didn't work."); } finally { setBusy(false); } };
  const askNotif = async () => { haptic(); try { if ("Notification" in window) perms.current.notif = (await Notification.requestPermission()) === "granted"; } catch {} setStep(5); };
  const askContacts = async () => { haptic(); try { if ("contacts" in navigator) { const p = await navigator.contacts.select(["tel"], { multiple: true }); perms.current.contacts = p.length > 0; } } catch {} finish(); };
  const finish = () => { haptic(12); onDone({ ...perms.current, name: name.trim(), agreedAt: new Date().toISOString() }); };
  return (
    <div className="app">
      {legal && <LegalSheet doc={legal} onClose={() => setLegal(null)} />}
      <div className="ob">
        {step > 0 && step < 3 && <div className="navbar" style={{ padding: 0 }}><button className="navbtn" onClick={() => setStep(s => s - 1)}><ChevronLeft size={24} /> Back</button></div>}
        {step === 0 && <>
          <div className="obtop">
            <div className="obicon"><Radar size={34} /></div>
            <div className="obtitle">Show Face</div>
            <div className="obbody">One tap tells your people you're out. It turns itself off after {BEACON_HOURS} hours.</div>
            <div className="oblist">
              <div className="obrow"><div className="ic"><Radar size={14} /></div><div className="t"><b>Tap once.</b> Your friends see you're around — no planning, no group chat.</div></div>
              <div className="obrow"><div className="ic"><Users size={14} /></div><div className="t"><b>Only your people.</b> Nobody outside your friends can see you.</div></div>
              <div className="obrow"><div className="ic"><Shield size={14} /></div><div className="t"><b>It expires.</b> Your light goes out on its own. No background tracking, ever.</div></div>
            </div>
          </div>
          <button className="btn primary" onClick={next}>Get started</button>
          {onDemo && <button className="btn plain" style={{ marginTop: 6 }} onClick={onDemo}>Look around first</button>}
        </>}
        {step === 1 && <>
          <div className="obtop">
            <div className="obtitle">What's your number?</div>
            <div className="obbody">We'll text you a code. Your number is how friends find you — we never show it publicly.</div>
            <div style={{ marginTop: 26 }}><input className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            <label className="consent" onClick={() => { haptic(); setAgree(a => !a); }}>
              <span className={`box ${agree ? "on" : ""}`}>{agree && <Check size={14} strokeWidth={3} />}</span>
              <span className="ct">I'm 13 or older and I agree to the <span className="link" onClick={e => { e.stopPropagation(); setLegal("terms"); }}>Terms of Service</span> and <span className="link" onClick={e => { e.stopPropagation(); setLegal("privacy"); }}>Privacy Policy</span>.</span>
            </label>
            {err && <div className="err">{err}</div>}
          </div>
          <button className="btn primary" disabled={!agree || phone.replace(/\D/g, "").length < 8 || busy} onClick={send}>{busy ? "Sending…" : "Send code"}</button>
          <div className="footnote" style={{ textAlign: "center", padding: "12px 0 0" }}>Message and data rates may apply.</div>
        </>}
        {step === 2 && <>
          <div className="obtop">
            <div className="obtitle">Enter the code</div><div className="obbody">We sent a 6-digit code to {phone}.</div>
            <div style={{ marginTop: 26 }}><input className="input" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" value={code} onChange={e => setCode(e.target.value)} style={{ fontSize: 24, letterSpacing: 6, textAlign: "center" }} /></div>
            {err && <div className="err">{err}</div>}
          </div>
          <button className="btn primary" disabled={code.length < 4 || busy} onClick={verify}>{busy ? "Checking…" : "Continue"}</button>
        </>}
        {step === 3 && <>
          <div className="obtop">
            <div className="obtitle">What should friends call you?</div>
            <div className="obbody">This is the name that shows when your light's on.</div>
            <div style={{ marginTop: 26 }}><input className="input" autoComplete="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} maxLength={40} autoFocus /></div>
          </div>
          <button className="btn primary" disabled={name.trim().length < 2} onClick={next}>Continue</button>
        </>}
        {step === 4 && <>
          <div className="obtop">
            <div className="obicon"><Bell size={32} /></div>
            <div className="obtitle">Know when your friends are out</div>
            <div className="obbody">We'll send you a notification when someone in your circle turns their light on. That's the only thing we notify you about.</div>
          </div>
          <button className="btn primary" onClick={askNotif}>Allow notifications</button>
          <button className="btn plain" style={{ marginTop: 6 }} onClick={() => setStep(5)}>Not now</button>
        </>}
        {step === 5 && <>
          <div className="obtop">
            <div className="obicon"><Contact size={32} /></div>
            <div className="obtitle">Find friends already here</div>
            <div className="obbody">We match scrambled phone numbers only — never names, never emails — and we never message your contacts.</div>
            <div className="footnote" style={{ padding: "16px 0 0" }}>Details in the <span className="link" onClick={() => setLegal("privacy")}>Privacy Policy</span>.</div>
          </div>
          <button className="btn primary" onClick={askContacts}>Allow contact matching</button>
          <button className="btn plain" style={{ marginTop: 6 }} onClick={finish}>Skip — I'll add friends myself</button>
        </>}
        <div className="dots">{[0, 1, 2, 3, 4, 5].map(i => <i key={i} className={i === step ? "on" : ""} />)}</div>
      </div>
    </div>
  );
}

/* ================= APP ================= */
export default function ShowFace() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(!isConfigured);
  const [onboarded, setOnboarded] = useState(false);
  const [demo, setDemo] = useState(false);
  const [tab, setTab] = useState("out");
  const [profile, setProfile] = useState(null);
  const [beacon, setBeacon] = useState(null);
  const [out, setOut] = useState([]);
  const [circles, setCircles] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pending, setPending] = useState([]);
  const [composer, setComposer] = useState(null);      // null | "normal" | "rally"
  const [recap, setRecap] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editName, setEditName] = useState(false); const [draft, setDraft] = useState("");
  const [legal, setLegal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => { const t = setInterval(() => tick(n => n + 1), 30000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) { try { const p = await getProfile(data.session.user.id); setProfile(p); if (p?.name) setOnboarded(true); } catch {} }
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (demo || !session) return;
    try {
      const [p, b, f, c, fr, rq, pd] = await Promise.all([
        getProfile(session.user.id), getMyBeacon(session.user.id), friendsOut(), myCircles(), myFriends(), myRequests(), myPending(),
      ]);
      setProfile(p); setBeacon(b); setOut(f); setCircles(c); setFriends(fr); setRequests(rq); setPending(pd);
    } catch (e) { console.error(e); }
  }, [session, demo]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (!session || demo) return; return onFriendLive(refresh); }, [session, demo, refresh]);
  useEffect(() => { if (demo) { setOut(DEMO); setCircles(DEMO_CIRCLES); setFriends(DEMO_FRIENDS); } }, [demo]);

  const endAndRecap = useCallback(async (b) => {
    setBeacon(null);
    if (demo) { setRecap({ ...b, joiners: [], going: 0 }); return; }
    try { const r = await lastRecap(); if (r) setRecap(r); } catch {}
  }, [demo]);
  useEffect(() => {
    if (!beacon) return;
    const ms = new Date(beacon.expires_at) - Date.now();
    if (ms <= 0) { endAndRecap(beacon); return; }
    const t = setTimeout(() => endAndRecap(beacon), Math.min(ms, 2 ** 31 - 1)); return () => clearTimeout(t);
  }, [beacon, endAndRecap]);

  const completeOnboarding = async (p) => {
    setOnboarded(true);
    if (session) {
      try {
        await saveProfile(session.user.id, { name: p.name, accepted_terms_at: p.agreedAt, notif_opt_in: !!p.notif, contacts_opt_in: !!p.contacts });
        setProfile(x => ({ ...(x || {}), name: p.name }));
      } catch (e) { console.error(e); }
    }
  };

  const tapBeacon = async () => {
    haptic(14);
    if (!beacon) { setComposer("normal"); return; }
    if (demo) { setBeacon(null); return; }
    setBusy(true); try { await killMyBeacon(session.user.id); setBeacon(null); } catch (e) { console.error(e); } finally { setBusy(false); }
  };
  const goOut = async ({ place, arriving, circle }) => {
    haptic(14); setComposer(null);
    const start = arriving || new Date().toISOString();
    const expires = new Date(new Date(start).getTime() + BEACON_HOURS * 36e5).toISOString();
    if (demo) { setBeacon({ id: "demo", started_at: start, expires_at: expires, place, circle_name: circle?.name }); return; }
    setBusy(true);
    try { setBeacon(await lightBeacon({ place: place || null, started_at: start, expires_at: expires, circle_id: circle?.id || null })); }
    catch (e) { console.error(e); } finally { setBusy(false); }
  };
  const reply = async (f, st) => {
    haptic(12); const mine = f.my_status === st;
    if (demo) { setOut(l => l.map(x => x.id === f.id ? { ...x, my_status: mine ? null : st, going: (x.going || 0) + (mine ? -1 : (st === "in" ? 1 : 0)) } : x)); return; }
    try { mine ? await unrespond(f.id) : await respond(f.id, st); await refresh(); } catch (e) { console.error(e); }
  };
  const accept = async (r) => { haptic(12); if (demo) return; try { await acceptFriend(r.id); await refresh(); } catch (e) { console.error(e); } };
  const decline = async (r) => { haptic(); if (demo) return; try { await removeFriend(r.id); await refresh(); } catch (e) { console.error(e); } };
  const saveName = async () => {
    const n = draft.trim(); if (n.length < 2) return; setEditName(false);
    setProfile(p => ({ ...(p || {}), name: n }));
    if (!demo && session) { try { await saveProfile(session.user.id, { name: n }); } catch (e) { console.error(e); } }
  };
  const invite = async () => {
    haptic(); const url = window.location.origin + window.location.pathname;
    if (navigator.share) { try { await navigator.share({ title: "Show Face", text: "Get on Show Face so you can see when I'm out.", url }); return; } catch {} }
    try { await navigator.clipboard.writeText(url); alert("Invite link copied."); } catch {}
  };

  if (!ready) return (<><style>{CSS}</style><div className="app" /></>);
  if (!onboarded && !demo) return (<><style>{CSS}</style><Onboarding session={session} onDone={completeOnboarding} onDemo={() => setDemo(true)} /></>);

  const name = profile?.name || (demo ? "You" : "You");
  const liveCount = out.length + (beacon ? 1 : 0);

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {legal && <LegalSheet doc={legal} onClose={() => setLegal(null)} />}
        {composer && <GoingOut rally={composer === "rally"} onGo={goOut} onClose={() => setComposer(null)} circles={circles} />}
        {recap && <Recap data={recap} onClose={() => setRecap(null)} onAgain={() => { setRecap(null); setComposer("normal"); }} />}
        {addOpen && <AddFriend demo={demo} onClose={() => setAddOpen(false)} onAdded={refresh} />}

        {/* ---------- OUT ---------- */}
        {tab === "out" && (
          <div className="scroll">
            <div className="navbar"><span /><button className="pf" onClick={() => setTab("you")}>{initials(name)}</button></div>
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
                {liveCount > 0 ? <><b className="tnum">{liveCount}</b> {liveCount === 1 ? "person is" : "people are"} out right now</>
                  : friends.length === 0 ? "Add a few friends to get started." : "Nobody's out yet. Be the first."}
              </div>
              {!beacon && friends.length > 0 && <button className="rallybtn" onClick={() => { haptic(); setComposer("rally"); }}><Megaphone size={15} /> Rally your people</button>}
            </div>

            {beacon && (
              <div className="livecard">
                <div className="ttl"><span className="livedot" />{beacon.circle_name ? `${beacon.circle_name} is out` : `You're out`}</div>
                <div className="mt">{beacon.place ? <>At <b>{beacon.place}</b> · </> : ""}{status(beacon)}</div>
                <div className="acts"><button className="lbtn" onClick={invite}><Share2 size={13} /> Share</button><button className="lbtn" onClick={tapBeacon}>End</button></div>
              </div>
            )}

            {out.length > 0 && <>
              <div className="grouphdr">Out now</div>
              <div className="group">
                {out.map(f => (
                  <div className="cell" key={f.id}>
                    <span className="avatar">{initials(f.circle_name || f.name)}<span className="dot" /></span>
                    <div className="celltext">
                      <div className="celltitle">{f.circle_name || f.name || "Friend"}{f.circle_name && <span className="grouptag"><Users size={9} /> Crew</span>}</div>
                      <div className="cellsub">{f.circle_name ? `${f.name} · ` : ""}{f.place ? `${f.place} · ` : ""}{status(f)}</div>
                      {f.going > 0 && <div className="joins"><div className="jstack">{(f.joiners || []).slice(0, 3).map((j, i) => <i key={i}>{(j || "?")[0]}</i>)}</div><span className="jtext"><b className="tnum">{f.going}</b> {f.going === 1 ? "person is" : "people are"} in</span></div>}
                    </div>
                    <div className="respond">
                      <button className={`rbtn icon ${f.my_status === "maybe" ? "on" : ""}`} onClick={() => reply(f, "maybe")}><Hand size={15} /></button>
                      <button className={`rbtn ${f.my_status === "in" ? "on" : ""}`} onClick={() => reply(f, "in")}>{f.my_status === "in" ? <><Check size={14} strokeWidth={3} /> In</> : "I'm in"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </>}

            {friends.length === 0 && !demo && (
              <div className="group" style={{ marginTop: 8 }}>
                <div className="cell tap" onClick={() => setAddOpen(true)}><span className="avatar dark"><UserPlus size={17} /></span><div className="celltext"><div className="celltitle">Add your first friend</div><div className="cellsub">Show Face only works with your people on it</div></div><ChevronRight size={18} className="chev" /></div>
              </div>
            )}
            {demo && <div className="banner">Demo mode — nothing here is real and nothing saves.</div>}
          </div>
        )}

        {/* ---------- FRIENDS ---------- */}
        {tab === "friends" && (
          <div className="scroll">
            <div className="navbar"><span /><button className="navbtn" onClick={() => setAddOpen(true)}><Plus size={24} /></button></div>
            <div className="largetitle">Friends</div>
            <div className="subtitle">The people who see your light — and whose lights you see.</div>

            {requests.length > 0 && <>
              <div className="grouphdr">Want to add you</div>
              <div className="group">
                {requests.map(r => (
                  <div className="cell" key={r.id}><span className="avatar">{initials(r.name)}</span><div className="celltext"><div className="celltitle">{r.name || "Someone"}</div></div>
                    <button className="smallbtn ghost" onClick={() => decline(r)}>Ignore</button><button className="smallbtn" onClick={() => accept(r)}>Accept</button></div>
                ))}
              </div>
            </>}

            <div className="grouphdr">Your people{friends.length > 0 ? ` · ${friends.length}` : ""}</div>
            {friends.length > 0 ? (
              <div className="group">{friends.map(f => (
                <div className="cell" key={f.id}><span className="avatar">{initials(f.name)}</span><div className="celltext"><div className="celltitle">{f.name || "Friend"}</div></div></div>
              ))}</div>
            ) : <div className="empty">No friends yet.<br />Add people by their phone number.</div>}

            {pending.length > 0 && <>
              <div className="grouphdr">Waiting on them</div>
              <div className="group">{pending.map(p => <div className="cell" key={p.id}><span className="avatar">{initials(p.name)}</span><div className="celltext"><div className="celltitle">{p.name || "Someone"}</div><div className="cellsub">Request sent</div></div></div>)}</div>
            </>}

            <div className="pad"><button className="btn primary" onClick={() => setAddOpen(true)}><UserPlus size={17} /> Add a friend</button></div>
          </div>
        )}

        {/* ---------- YOU ---------- */}
        {tab === "you" && (
          <div className="scroll">
            <div className="navbar"><span /><span /></div>
            <div className="largetitle">You</div>
            <div className="group" style={{ marginTop: 8 }}>
              <div className="cell tap" onClick={() => { setDraft(profile?.name || ""); setEditName(true); }}>
                <span className="avatar dark" style={{ width: 52, height: 52, fontSize: 19 }}>{initials(name)}</span>
                <div className="celltext"><div className="celltitle" style={{ fontWeight: 600 }}>{name}</div><div className="cellsub">{demo ? "Demo mode" : session?.user?.phone}</div></div>
                <Pencil size={16} className="chev" />
              </div>
            </div>
            <div className="grouphdr">Privacy</div>
            <div className="group">
              <div className="cell"><span className="celltext"><div className="celltitle">Who sees your light</div><div className="cellsub">Only friends you've added</div></span><span className="cellvalue">{friends.length}</span></div>
              <div className="cell"><span className="celltext"><div className="celltitle">Location</div><div className="cellsub">Only what you type — we never track you</div></span></div>
            </div>
            <div className="footnote">Your light turns itself off after {BEACON_HOURS} hours. Nothing runs in the background.</div>
            <div className="grouphdr">About</div>
            <div className="group">
              <div className="cell tap" onClick={() => setLegal("terms")}><div className="celltext"><div className="celltitle">Terms of Service</div></div><ChevronRight size={18} className="chev" /></div>
              <div className="cell tap" onClick={() => setLegal("privacy")}><div className="celltext"><div className="celltitle">Privacy Policy</div></div><ChevronRight size={18} className="chev" /></div>
            </div>
            <div className="pad">
              {!demo && <button className="btn danger" onClick={signOut}><LogOut size={17} /> Sign out</button>}
              {demo && <button className="btn secondary" onClick={() => { setDemo(false); setOnboarded(false); }}>Exit demo</button>}
            </div>
          </div>
        )}

        {editName && (
          <div className="scrim" onClick={e => e.target.classList.contains("scrim") && setEditName(false)}>
            <div className="sheet">
              <div className="sheethdr"><button className="navbtn" onClick={() => setEditName(false)}>Cancel</button><span className="navtitle">Your name</span><button className="navbtn" style={{ fontWeight: 600 }} onClick={saveName}>Save</button></div>
              <div className="sheetbody"><input className="input" value={draft} onChange={e => setDraft(e.target.value)} maxLength={40} autoFocus /></div>
            </div>
          </div>
        )}

        <div className="tabbar">
          <button className={`tab ${tab === "out" ? "on" : ""}`} onClick={() => { haptic(); setTab("out"); }}><Radar size={24} />Out</button>
          <button className={`tab ${tab === "friends" ? "on" : ""}`} onClick={() => { haptic(); setTab("friends"); }}><Users size={24} />Friends{requests.length > 0 && <span className="badge">{requests.length}</span>}</button>
          <button className={`tab ${tab === "you" ? "on" : ""}`} onClick={() => { haptic(); setTab("you"); }}><User size={24} />You</button>
        </div>
      </div>
    </>
  );
}
