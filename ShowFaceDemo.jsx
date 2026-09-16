import React, { useState, useEffect, useRef } from "react";
import {
  MapPin, Clock, Users, Megaphone, Check, Plus, X, Radar, Home, User,
  Send, ChevronRight, Sparkles, Lock, Share2, Shield, Navigation, Repeat,
  EyeOff, Moon, Coffee, Dumbbell, Wine, UtensilsCrossed, Pencil,
  Footprints, PersonStanding, Waves, CircleDot, Target, CalendarDays
} from "lucide-react";

/* ============================================================
   ShowFace — the beacon is the app.
   One tap to say you're out. Plus the things already happening
   in your neighborhood that you can just show up to.
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;450;500;600;700&display=swap');
.sf *{ box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
.sf{
  --bg:#F3F0E8; --card:#FFFFFF; --cream:#EDE8DC; --inset:#EFEBE2;
  --line:rgba(18,18,17,0.08); --line2:rgba(18,18,17,0.14);
  --ink:#141312; --ink2:#57554F; --muted:#928F85; --faint:#BBB8AE;
  font-family:'Inter',system-ui,sans-serif; color:var(--ink); letter-spacing:-0.005em;
  display:flex; justify-content:center; align-items:center; width:100%; min-height:100vh; padding:24px 12px;
  background:radial-gradient(1100px 700px at 50% -8%, #efece3, #ddd9cf);
}
.tnum{ font-variant-numeric:tabular-nums; }
.sf-phone{ width:100%; max-width:404px; height:846px; max-height:92vh; background:var(--bg); border-radius:50px; position:relative; overflow:hidden; border:1px solid rgba(0,0,0,0.08); box-shadow:0 0 0 10px #0c0c0d, 0 38px 88px rgba(0,0,0,0.4); display:flex; flex-direction:column; }
.sf-sb{ height:52px; flex:0 0 auto; display:flex; align-items:center; justify-content:space-between; padding:0 32px; font-size:14px; font-weight:600; z-index:25; }
.sf-sb .r{ display:flex; align-items:center; gap:6px; } .sf-sb .bars{ display:flex; gap:2px; align-items:flex-end; height:11px; } .sf-sb .bars i{ width:3px; background:var(--ink); border-radius:1px; display:block; }
.sf-sb .batt{ width:24px; height:12px; border:1.5px solid var(--ink); border-radius:3px; position:relative; } .sf-sb .batt::after{ content:""; position:absolute; left:1.5px; top:1.5px; bottom:1.5px; width:64%; background:var(--ink); border-radius:1px; } .sf-sb .batt::before{ content:""; position:absolute; right:-3px; top:3px; height:5px; width:2px; background:var(--ink); border-radius:2px; }
.sf-screen{ flex:1 1 auto; overflow-y:auto; overflow-x:hidden; } .sf-screen::-webkit-scrollbar{ width:0; } .sf-pad{ padding-bottom:120px; }

.hdr{ display:flex; align-items:center; justify-content:space-between; padding:10px 24px 0; }
.hdr .when{ font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); font-weight:600; }
.pfbtn{ width:38px; height:38px; border-radius:50%; background:var(--ink); color:var(--cream); display:flex; align-items:center; justify-content:center; cursor:pointer; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:13px; letter-spacing:-0.02em; transition:.15s; } .pfbtn:hover{ filter:brightness(1.25); }
.titlebar{ display:flex; align-items:flex-end; justify-content:space-between; padding:12px 24px 4px; } .titlebar .tt{ font-family:'Space Grotesk',sans-serif; font-size:32px; font-weight:700; letter-spacing:-0.04em; line-height:1; }
.tbtn{ width:40px; height:40px; border-radius:50%; background:var(--card); border:1px solid var(--line); display:flex; align-items:center; justify-content:center; color:var(--ink); cursor:pointer; transition:.15s; } .tbtn:hover{ background:var(--inset); }
.sub{ color:var(--ink2); font-size:14px; line-height:1.5; margin:6px 24px 0; max-width:32ch; }
.plusbadge{ display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:700; color:var(--cream); background:var(--ink); padding:3px 9px; border-radius:30px; vertical-align:middle; margin-left:8px; letter-spacing:0; }

/* --- THE BEACON --- */
.stage{ display:flex; flex-direction:column; align-items:center; justify-content:center; padding:46px 0 0; }
.beacon{ width:262px; height:262px; border-radius:50%; position:relative; cursor:pointer; background:none; border:none; outline:none; display:flex; align-items:center; justify-content:center; }
.beacon .core{ position:absolute; inset:33px; border-radius:50%; background:var(--card); border:1px solid var(--line2); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:9px; transition:.4s cubic-bezier(.2,.8,.2,1); box-shadow:0 10px 34px rgba(0,0,0,0.07); }
.beacon .ring{ position:absolute; border-radius:50%; border:1px solid rgba(18,18,17,0.22); inset:0; opacity:0; }
.beacon-idle .ring{ animation:pulse 4s ease-out infinite; } .beacon-idle .ring.r2{ animation-delay:1.33s; } .beacon-idle .ring.r3{ animation-delay:2.66s; }
@keyframes pulse{ 0%{ inset:82px; opacity:0 } 15%{ opacity:.4 } 100%{ inset:0px; opacity:0 } }
.beacon .label{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:25px; letter-spacing:-0.03em; }
.beacon .meta{ font-size:12px; color:var(--muted); font-weight:500; }
.beacon-live .core{ inset:25px; background:var(--ink); border-color:var(--ink); color:var(--cream); box-shadow:0 24px 60px rgba(18,18,17,0.34); }
.beacon-live .label{ color:var(--cream); } .beacon-live .meta{ color:rgba(243,240,232,0.6); }
.beacon-live .halo{ position:absolute; inset:-14px; border-radius:50%; background:radial-gradient(circle, rgba(18,18,17,0.13), transparent 62%); animation:halo 3.2s ease-in-out infinite; }
@keyframes halo{ 0%,100%{ transform:scale(1); opacity:.6 } 50%{ transform:scale(1.05); opacity:.95 } }
.beacon:active .core{ transform:scale(.96); }
.rally{ margin-top:24px; display:inline-flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; color:var(--ink2); background:none; border:none; padding:8px 12px; cursor:pointer; transition:.15s; } .rally:hover{ color:var(--ink); }
.countline{ margin-top:14px; font-size:13.5px; color:var(--ink2); text-align:center; } .countline b{ font-family:'Space Grotesk',sans-serif; color:var(--ink); font-weight:600; }

.livecard{ margin:28px 24px 0; background:var(--ink); color:var(--cream); border-radius:22px; padding:18px 20px; }
.livecard .ttl{ font-weight:600; font-size:15.5px; display:flex; align-items:center; gap:9px; }
.livedot{ width:9px; height:9px; border-radius:50%; background:var(--cream); }
.livecard .mt{ color:rgba(243,240,232,0.7); font-size:13px; margin-top:9px; line-height:1.55; } .livecard .mt b{ color:var(--cream); font-weight:600; }
.livecard .acts{ display:flex; gap:8px; margin-top:15px; }
.lbtn{ font-size:12.5px; font-weight:600; color:var(--cream); background:rgba(255,255,255,0.12); border:none; border-radius:30px; padding:9px 14px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; } .lbtn:hover{ background:rgba(255,255,255,0.2); }

.sect{ display:flex; align-items:baseline; justify-content:space-between; margin:36px 24px 13px; } .sect h3{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:17px; letter-spacing:-0.025em; }
.sect .meta{ font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); font-weight:600; }
.sect .link{ font-size:12.5px; color:var(--ink); cursor:pointer; display:flex; align-items:center; gap:2px; font-weight:600; }
.list{ margin:0 20px; background:var(--card); border:1px solid var(--line); border-radius:20px; overflow:hidden; }
.row{ display:flex; align-items:center; gap:13px; padding:15px 16px; border-top:1px solid var(--line); } .row:first-child{ border-top:none; }
.av{ width:42px; height:42px; border-radius:13px; flex:0 0 auto; display:flex; align-items:center; justify-content:center; font-weight:600; font-size:14px; background:var(--inset); color:var(--ink); position:relative; }
.av .ld{ position:absolute; top:-2px; right:-2px; width:11px; height:11px; border-radius:50%; background:var(--ink); border:2px solid var(--card); }
.body{ flex:1 1 auto; min-width:0; } .nm{ font-weight:600; font-size:14.5px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.where{ color:var(--ink2); font-size:13px; margin-top:4px; display:flex; align-items:center; gap:5px; flex-wrap:wrap; } .where .t{ color:var(--ink); font-weight:600; }
.btn{ flex:0 0 auto; align-self:center; font-size:12.5px; font-weight:600; padding:9px 15px; border-radius:30px; border:1px solid var(--line2); background:var(--card); color:var(--ink); cursor:pointer; transition:.15s; } .btn:hover{ border-color:var(--ink); } .btn.fill{ background:var(--ink); color:var(--cream); border-color:var(--ink); }

/* --- meetups --- */
.filters{ display:flex; gap:8px; padding:0 20px; overflow-x:auto; } .filters::-webkit-scrollbar{ height:0; }
.fchip{ flex:0 0 auto; display:flex; align-items:center; gap:7px; font-size:13px; font-weight:600; padding:9px 14px; border-radius:30px; border:1px solid var(--line2); background:var(--card); color:var(--ink2); cursor:pointer; transition:.14s; } .fchip:hover{ border-color:var(--ink); color:var(--ink); } .fchip.on{ background:var(--ink); border-color:var(--ink); color:var(--cream); }
.mucard{ margin:0 20px 12px; background:var(--card); border:1px solid var(--line); border-radius:20px; padding:17px; cursor:pointer; transition:.16s; } .mucard:hover{ background:var(--inset); }
.mutop{ display:flex; align-items:flex-start; gap:13px; }
.muicon{ width:44px; height:44px; border-radius:14px; flex:0 0 auto; background:var(--ink); color:var(--cream); display:flex; align-items:center; justify-content:center; }
.muname{ font-weight:600; font-size:15.5px; letter-spacing:-0.01em; }
.mumeta{ font-size:12.5px; color:var(--ink2); margin-top:4px; display:flex; align-items:center; gap:5px; flex-wrap:wrap; }
.mumeta .t{ color:var(--ink); font-weight:600; }
.tag{ font-size:9.5px; letter-spacing:.04em; padding:3px 8px; border-radius:20px; font-weight:700; text-transform:uppercase; background:var(--inset); color:var(--ink2); }
.tag.dark{ background:var(--ink); color:var(--cream); }
.mubot{ display:flex; align-items:center; justify-content:space-between; margin-top:15px; padding-top:14px; border-top:1px solid var(--line); }
.going{ display:flex; align-items:center; gap:9px; } .gstack{ display:flex; } .gstack .mini{ width:24px; height:24px; border-radius:8px; border:2px solid var(--card); margin-left:-8px; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:700; background:var(--inset); color:var(--ink2); } .gstack .mini:first-child{ margin-left:0; }
.gtext{ font-size:12px; color:var(--ink2); } .gtext b{ color:var(--ink); font-weight:600; }
.daylbl{ font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); font-weight:700; margin:26px 24px 12px; }
.hostbar{ margin:8px 20px 0; background:var(--card); border:1px dashed var(--line2); border-radius:20px; padding:16px 18px; display:flex; align-items:center; gap:13px; cursor:pointer; transition:.15s; } .hostbar:hover{ background:var(--inset); }
.hostbar .hi{ width:40px; height:40px; border-radius:12px; background:var(--ink); color:var(--cream); display:flex; align-items:center; justify-content:center; flex:0 0 auto; }
.hostbar .ht{ font-weight:600; font-size:14px; } .hostbar .hd{ font-size:12px; color:var(--ink2); margin-top:2px; }
.detailhero{ background:var(--ink); color:var(--cream); border-radius:22px; padding:22px; margin-top:6px; }
.detailhero .dh{ display:flex; align-items:center; gap:13px; } .detailhero .di{ width:48px; height:48px; border-radius:15px; background:rgba(255,255,255,0.13); display:flex; align-items:center; justify-content:center; flex:0 0 auto; }
.detailhero .dn{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:21px; letter-spacing:-0.03em; }
.detailhero .dm{ font-size:12.5px; color:rgba(243,240,232,0.65); margin-top:3px; }
.detailhero .drow{ display:flex; gap:22px; margin-top:20px; padding-top:18px; border-top:1px solid rgba(255,255,255,0.14); }
.detailhero .dk{ font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:rgba(243,240,232,0.5); font-weight:700; } .detailhero .dv{ font-size:14px; font-weight:600; margin-top:5px; }
.desc{ font-size:14px; color:var(--ink2); line-height:1.6; margin-top:20px; }

/* --- circles --- */
.circ{ display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:0 20px; }
.ccard{ background:var(--card); border:1px solid var(--line); border-radius:20px; padding:17px; cursor:pointer; transition:.16s; position:relative; } .ccard:hover{ background:var(--inset); }
.ccard .ci{ width:34px; height:34px; border-radius:11px; background:var(--ink); color:var(--cream); display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:15px; }
.ccard .cn{ font-weight:600; font-size:15px; margin-top:13px; } .ccard .cc{ font-size:12px; color:var(--ink2); margin-top:3px; }
.ccard .cnow{ margin-top:14px; font-size:11.5px; font-weight:600; } .ccard .cnow.on{ color:var(--ink); } .ccard .cnow.q{ color:var(--faint); }
.ccard.add{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; border-style:dashed; border-color:var(--line2); color:var(--ink2); min-height:130px; }
.lockpill{ position:absolute; top:11px; right:11px; display:flex; align-items:center; gap:3px; font-size:9px; font-weight:700; color:var(--cream); background:var(--ink); padding:3px 7px; border-radius:20px; }

/* --- profile --- */
.profile{ margin:8px 24px 0; }
.ptop{ display:flex; align-items:center; gap:16px; }
.pavatar{ width:76px; height:76px; border-radius:50%; flex:0 0 auto; position:relative; background:linear-gradient(150deg,#2a2824,#141312); display:flex; align-items:center; justify-content:center; color:var(--cream); font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:27px; letter-spacing:-0.02em; }
.pid{ flex:1; min-width:0; }
.pname{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:22px; letter-spacing:-0.03em; }
.phandle{ font-size:13px; color:var(--muted); margin-top:3px; display:flex; align-items:center; gap:9px; }
.outnow{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; color:var(--ink); } .outnow .od{ width:7px; height:7px; border-radius:50%; background:var(--ink); }
.ploc{ font-size:12.5px; color:var(--ink2); margin-top:8px; display:flex; align-items:center; gap:5px; }
.pactions{ display:flex; gap:9px; margin-top:18px; }
.pbtn{ flex:1; padding:11px; border-radius:13px; border:1px solid var(--line2); background:var(--card); color:var(--ink); font-weight:600; font-size:13.5px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:7px; transition:.15s; } .pbtn:hover{ border-color:var(--ink); }
.stats{ margin:26px 20px 0; background:var(--card); border:1px solid var(--line); border-radius:22px; display:grid; grid-template-columns:1fr 1fr 1fr; padding:20px 0; }
.stats .s{ text-align:center; border-left:1px solid var(--line); } .stats .s:first-child{ border-left:none; }
.stats .v{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:25px; letter-spacing:-0.02em; } .stats .k{ font-size:10.5px; color:var(--ink2); margin-top:4px; }
.settingrow{ display:flex; align-items:center; justify-content:space-between; padding:16px; border-top:1px solid var(--line); cursor:pointer; } .settingrow:first-child{ border-top:none; } .settingrow:hover{ background:var(--inset); }
.settingrow .sl{ font-weight:600; font-size:14px; display:flex; align-items:center; gap:11px; } .settingrow .sd{ font-size:12px; color:var(--ink2); margin-top:2px; margin-left:27px; }

/* --- sheets --- */
.scrim{ position:absolute; inset:0; background:rgba(18,18,17,0.4); backdrop-filter:blur(3px); z-index:40; display:flex; align-items:flex-end; animation:fade .2s ease; } @keyframes fade{ from{opacity:0} to{opacity:1} }
.sheet{ width:100%; background:var(--bg); border-radius:32px 32px 50px 50px; border-top:1px solid var(--line2); padding:12px 22px 36px; max-height:92%; overflow-y:auto; animation:rise .32s cubic-bezier(.2,.85,.25,1); } .sheet::-webkit-scrollbar{ width:0; } @keyframes rise{ from{ transform:translateY(100%) } to{ transform:translateY(0) } }
.grab{ width:40px; height:5px; border-radius:3px; background:var(--line2); margin:0 auto 18px; }
.sheet h2{ font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:24px; letter-spacing:-0.04em; } .shsub{ color:var(--ink2); font-size:13.5px; margin-top:6px; }
.fld{ margin-top:22px; } .fld .fl{ font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:10px; display:block; font-weight:600; }
.chips{ display:flex; flex-wrap:wrap; gap:8px; } .chip{ font-size:13px; font-weight:500; padding:10px 14px; border-radius:30px; border:1px solid var(--line2); background:var(--card); color:var(--ink2); cursor:pointer; transition:.14s; display:flex; align-items:center; gap:6px; } .chip:hover{ border-color:var(--ink); color:var(--ink); } .chip.on{ background:var(--ink); border-color:var(--ink); color:var(--cream); font-weight:600; }
.pinput{ width:100%; margin-top:8px; padding:13px 14px; border-radius:13px; border:1px solid var(--line2); background:var(--card); color:var(--ink); font-family:'Inter'; font-size:15px; outline:none; } .pinput:focus{ border-color:var(--ink); }
.peditav{ display:flex; justify-content:center; margin-top:6px; } .peditav .pavatar{ width:84px; height:84px; font-size:30px; }
.switchrow{ display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:15px 16px; background:var(--card); border:1px solid var(--line2); border-radius:14px; }
.switchrow .sl{ font-weight:500; font-size:14px; display:flex; align-items:center; gap:9px; } .switchrow .sd{ font-size:11.5px; color:var(--muted); margin-top:3px; }
.sw{ width:46px; height:27px; border-radius:30px; background:var(--line2); position:relative; cursor:pointer; transition:.18s; flex:0 0 auto; } .sw.on{ background:var(--ink); } .sw::after{ content:""; position:absolute; top:3px; left:3px; width:21px; height:21px; border-radius:50%; background:#fff; transition:.18s; } .sw.on::after{ left:22px; }
.sendbtn{ width:100%; margin-top:26px; padding:17px; border-radius:16px; border:none; cursor:pointer; font-weight:600; font-size:16px; background:var(--ink); color:var(--cream); display:flex; align-items:center; justify-content:center; gap:9px; } .sendbtn:hover{ filter:brightness(1.25); } .sendbtn:disabled{ background:var(--inset); color:var(--faint); cursor:not-allowed; }
.ghostwide{ width:100%; margin-top:10px; padding:15px; border-radius:16px; border:1px solid var(--line2); background:var(--card); color:var(--ink); font-weight:600; font-size:14.5px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; } .ghostwide:hover{ border-color:var(--ink); }
.close{ width:34px; height:34px; border-radius:50%; border:1px solid var(--line); background:var(--card); display:flex; align-items:center; justify-content:center; color:var(--ink2); cursor:pointer; flex:0 0 auto; }
.cmp{ margin-top:22px; border-radius:16px; overflow:hidden; border:1px solid var(--line2); background:var(--card); }
.cr{ display:flex; align-items:center; gap:12px; padding:14px 15px; border-top:1px solid var(--line); font-size:13.5px; } .cr:first-child{ border-top:none; }
.ck{ width:20px; height:20px; border-radius:50%; flex:0 0 auto; display:flex; align-items:center; justify-content:center; } .ck.free{ background:var(--inset); color:var(--muted); } .ck.plus{ background:var(--ink); color:var(--cream); }
.cr .ct3{ flex:1; } .pp2{ font-size:15px; margin-top:14px; font-weight:500; } .pp2 span{ color:var(--faint); } .premnote{ text-align:center; color:var(--faint); font-size:11px; margin-top:12px; }

.bnav{ position:absolute; bottom:0; left:0; right:0; height:84px; display:flex; align-items:center; justify-content:space-around; padding:0 14px 22px; background:rgba(243,240,232,0.85); backdrop-filter:blur(20px); border-top:1px solid var(--line); z-index:20; }
.nb{ background:none; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:5px; color:var(--muted); font-size:10px; font-weight:500; flex:1; transition:.15s; } .nb.act{ color:var(--ink); }
.toast{ position:absolute; top:58px; left:16px; right:16px; z-index:60; background:var(--ink); color:var(--cream); border-radius:16px; padding:14px 16px; display:flex; align-items:center; gap:12px; box-shadow:0 16px 44px rgba(0,0,0,0.3); animation:drop .35s cubic-bezier(.2,.85,.25,1); cursor:pointer; }
@keyframes drop{ from{ transform:translateY(-130%); opacity:0 } to{ transform:translateY(0); opacity:1 } }
.toast .ti{ width:36px; height:36px; border-radius:11px; flex:0 0 auto; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.12); }
.toast .tt2{ font-weight:600; font-size:13.5px; } .toast .td{ font-size:12px; color:rgba(243,240,232,0.6); margin-top:2px; }
@media (prefers-reduced-motion: reduce){ .ring,.halo{ animation:none !important; } }
`;

const initials = (n) => n.split(" ").map(w=>w[0]).slice(0,2).join("");

const KINDS = [
  { id:"run", label:"Run club", icon:Footprints },
  { id:"yoga", label:"Yoga", icon:PersonStanding },
  { id:"gym", label:"Gym", icon:Dumbbell },
  { id:"recovery", label:"Recovery", icon:Waves },
  { id:"pickleball", label:"Pickleball", icon:Target },
  { id:"basketball", label:"Basketball", icon:CircleDot },
  { id:"coffee", label:"Coffee", icon:Coffee },
  { id:"night", label:"Night out", icon:Moon },
];
const kindOf = (id) => KINDS.find(k=>k.id===id) || KINDS[0];

const MEETUPS = [
  { id:1, kind:"run", name:"Sunrise Run Club", spot:"Westlake Promenade", day:"today", time:"6:30 AM", every:"Every Tue & Thu", dist:"0.8 mi", going:14, host:"Marcus B.", who:["Marcus","Priya","Tasha"], desc:"Easy 3-mile loop around the lake, coffee after. All paces — nobody gets dropped." },
  { id:2, kind:"basketball", name:"Pickup Hoops", spot:"Berniece Bennett Park", day:"today", time:"7:00 PM", every:"Every weeknight", dist:"1.2 mi", going:9, host:"Dev S.", who:["Dev","Ben"], desc:"Run it till the lights go off. Bring a light and a dark shirt." },
  { id:3, kind:"yoga", name:"Sunset Flow", spot:"Malibu Bluffs", day:"today", time:"6:45 PM", every:"Sundays", dist:"4.1 mi", going:22, host:"Ana R.", who:["Ana","Mia","Sam"], desc:"Vinyasa on the grass overlooking the water. Bring a mat and a layer." },
  { id:4, kind:"pickleball", name:"Open Play Pickleball", spot:"Triunfo Community Park", day:"tomorrow", time:"9:00 AM", every:"Sat & Sun", dist:"2.4 mi", going:16, host:"Ben O.", who:["Ben","Sam"], desc:"Rotating doubles, paddles to borrow. Beginners genuinely welcome." },
  { id:5, kind:"gym", name:"Push Day Crew", spot:"Iron Age Gym", day:"tomorrow", time:"5:30 PM", every:"Mon / Wed / Fri", dist:"0.5 mi", going:7, host:"Steve M.", who:["Marcus","Dev"], desc:"Chest and shoulders, 75 minutes, no phones between sets." },
  { id:6, kind:"recovery", name:"Sauna + Cold Plunge", spot:"Reset Recovery Lab", day:"this week", time:"Thu · 8:00 AM", every:"Thursdays", dist:"1.9 mi", going:11, host:"Tasha C.", who:["Tasha","Priya"], desc:"Three rounds, contrast protocol. First session is on the house." },
  { id:7, kind:"run", name:"Track Tuesdays", spot:"Westlake HS Track", day:"this week", time:"Tue · 6:00 PM", every:"Tuesdays", dist:"1.1 mi", going:19, host:"Ana R.", who:["Ana","Marcus"], desc:"400s and 800s with a group. Coached warmup, everyone finishes together." },
  { id:8, kind:"coffee", name:"Sunday Coffee Walk", spot:"Lakeside Café", day:"this week", time:"Sun · 8:30 AM", every:"Sundays", dist:"0.6 mi", going:12, host:"Mia T.", who:["Mia","Sam","Ana"], desc:"Two-mile walk, then coffee. The lowest-effort way to see people." },
];

const CIRCLES = [
  { id:"friday", name:"Friday Night People", count:14 },
  { id:"college", name:"College Friends", count:23 },
  { id:"ball", name:"Basketball Crew", count:9 },
  { id:"work", name:"Work Friends", count:18 },
];
const LOCATIONS = ["Westlake Village","Santa Monica","Malibu","Downtown LA","Venice"];
const TIMES = ["Now","6:00 PM","7:00 PM","8:00 PM","Late"];
const EXPIRES = ["2 hrs","4 hrs","End of night"];
const SEED = [
  { id:1, name:"Marcus Bell", circle:"college", spot:"The Local", time:"8:00 PM", eta:"8 min", live:true },
  { id:2, name:"Priya Raman", circle:"friday", spot:"Lakeside Café", time:"7:45 PM", eta:"on site", live:true },
  { id:3, name:"Tasha Cole", circle:"college", spot:"Reset Recovery Lab", time:"9:00 AM", eta:"15 min", live:true },
  { id:4, name:"Ben Ortiz", circle:"work", spot:"Iron Age Gym", time:"6:30 PM", eta:"on the way", live:true },
];
const PLUS_FEATURES = [
  { t:"See your friends and join them", free:true },
  { t:"Join any meetup in your neighborhood", free:true },
  { t:"Host unlimited recurring meetups", free:false },
  { t:"Unlimited circles", free:false },
  { t:"See people out beyond your circle", free:false },
];

export default function ShowFace(){
  const [tab, setTab] = useState("tonight");
  const [composer, setComposer] = useState(null);
  const [premium, setPremium] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [editP, setEditP] = useState(false);
  const [detail, setDetail] = useState(null);
  const [hostSheet, setHostSheet] = useState(false);
  const [isPlus, setIsPlus] = useState(false);

  const [filter, setFilter] = useState("all");
  const [pickAct, setPickAct] = useState("night");
  const [pickLoc, setPickLoc] = useState("Westlake Village");
  const [pickTime, setPickTime] = useState("8:00 PM");
  const [pickCircles, setPickCircles] = useState(["friday"]);
  const [pickExpire, setPickExpire] = useState("End of night");

  const [hKind, setHKind] = useState("run");
  const [hName, setHName] = useState("");
  const [hSpot, setHSpot] = useState("");
  const [hTime, setHTime] = useState("");
  const [hRepeat, setHRepeat] = useState(true);

  const [myStatus, setMyStatus] = useState(null);
  const [friends] = useState(SEED);
  const [meetups, setMeetups] = useState(MEETUPS);
  const [joinedM, setJoinedM] = useState({});
  const [joined, setJoined] = useState({});
  const [priv, setPriv] = useState({ approx:false, hide:false, quiet:false });
  const [profile, setProfile] = useState({ name:"Steve Mercer", handle:"steve", location:"Westlake Village" });
  const [draftName, setDraftName] = useState("");
  const [draftLoc, setDraftLoc] = useState("");
  const [toast, setToast] = useState(null);
  const timers = useRef([]);

  const liveCount = friends.filter(f=>f.live).length + (myStatus ? 1 : 0);
  const showToast = (t, ms=3200) => { setToast(t); timers.current.push(setTimeout(()=>setToast(null), ms)); };
  useEffect(()=>()=>timers.current.forEach(clearTimeout), []);

  const liveAv = (live) => ({ boxShadow: live ? "0 0 0 3px var(--bg), 0 0 0 5px var(--ink)" : undefined });
  const openEdit = () => { setDraftName(profile.name); setDraftLoc(profile.location); setEditP(true); };
  const saveProfile = () => { setProfile(p=>({ ...p, name:draftName.trim()||p.name, location:draftLoc.trim()||p.location })); setEditP(false); showToast({ title:"Profile updated" }); };

  const openComposer = (mode) => { setComposer(mode); if(mode==="rally"){ setPickCircles(CIRCLES.map(c=>c.id)); setPickTime("Now"); } };
  const toggleCircle = (id) => setPickCircles(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);
  const sendShowFace = () => {
    const rally = composer==="rally"; const act = kindOf(pickAct);
    setMyStatus({ loc:pickLoc, time:pickTime, rally, expire:pickExpire, act }); setComposer(null);
    showToast({ rally, title: rally ? "Rally sent" : "Your light is on", desc:`${pickLoc} · ${pickTime}` });
    timers.current.push(setTimeout(()=>showToast({ title:"Marcus is out too", desc:"The Local · 8 min away" }), 2800));
  };
  const endShowFace = () => { setMyStatus(null); showToast({ title:"Light's off" }); };
  const toggleJoin = (f) => { setJoined(j=>({ ...j, [f.id]:!j[f.id] })); if(!joined[f.id]) showToast({ title:`On your way to ${f.spot}`, desc:`${f.name.split(" ")[0]} can see your ETA` }); };
  const toggleMeetup = (m) => {
    const on = joinedM[m.id];
    setJoinedM(j=>({ ...j, [m.id]:!on }));
    setMeetups(l=>l.map(x=>x.id===m.id?{...x, going:x.going+(on?-1:1)}:x));
    if(!on) showToast({ title:`You're in · ${m.name}`, desc:`${m.time} at ${m.spot}` });
  };
  const createMeetup = () => {
    const m = { id:Date.now(), kind:hKind, name:hName.trim()||`${kindOf(hKind).label} meetup`, spot:hSpot.trim()||"Your spot", day:"this week", time:hTime.trim()||"6:00 PM", every:hRepeat?"Weekly":"One-off", dist:"0 mi", going:1, host:"You", who:[profile.name.split(" ")[0]], desc:"You're hosting this one." };
    setMeetups(l=>[m, ...l]); setJoinedM(j=>({ ...j, [m.id]:true }));
    setHostSheet(false); setHName(""); setHSpot(""); setHTime(""); setTab("nearby");
    showToast({ title:"Meetup posted", desc:"Your neighborhood can see it now." });
  };
  const goPlus = () => { setIsPlus(true); setPremium(false); showToast({ title:"Welcome to ShowFace+" }); };

  const shown = filter==="all" ? meetups : meetups.filter(m=>m.kind===filter);
  const byDay = (d) => shown.filter(m=>m.day===d);

  const MeetupCard = ({m}) => {
    const I = kindOf(m.kind).icon;
    return (
      <div className="mucard" onClick={()=>setDetail(m)}>
        <div className="mutop">
          <div className="muicon"><I size={21}/></div>
          <div style={{flex:1, minWidth:0}}>
            <div className="muname">{m.name}</div>
            <div className="mumeta"><Clock size={12}/> <span className="t">{m.time}</span> · <MapPin size={12}/> {m.spot}</div>
            <div className="mumeta" style={{marginTop:7}}>
              <span className="tag"><Repeat size={9} style={{verticalAlign:-1, marginRight:3}}/>{m.every}</span>
              <span className="tag">{m.dist}</span>
            </div>
          </div>
        </div>
        <div className="mubot">
          <div className="going">
            <div className="gstack">{m.who.slice(0,3).map((w,i)=><div className="mini" key={i}>{w[0]}</div>)}</div>
            <span className="gtext"><b className="tnum">{m.going}</b> going</span>
          </div>
          <button className={`btn ${joinedM[m.id]?"fill":""}`} onClick={(e)=>{ e.stopPropagation(); toggleMeetup(m); }}>{joinedM[m.id]?"Going":"Join"}</button>
        </div>
      </div>
    );
  };

  const Tonight = (
    <div>
      <div className="hdr">
        <span className="when">Friday · {profile.location}</span>
        <div className="pfbtn" style={liveAv(!!myStatus)} onClick={()=>setTab("you")}>{initials(profile.name)}</div>
      </div>

      <div className="stage">
        <button className={`beacon ${myStatus?"beacon-live":"beacon-idle"}`} onClick={()=>myStatus?endShowFace():openComposer("normal")}>
          {!myStatus && <><span className="ring r1"/><span className="ring r2"/><span className="ring r3"/></>}
          {myStatus && <span className="halo"/>}
          <div className="core">
            {myStatus ? <Check size={28} strokeWidth={2.4}/> : <Radar size={28} color="#141312"/>}
            <span className="label">{myStatus ? "You're out" : "Show Face"}</span>
            <span className="meta">{myStatus ? "tap to end" : "one tap"}</span>
          </div>
        </button>
        <div className="countline"><b className="tnum">{liveCount}</b> {liveCount===1?"person":"people"} out near you</div>
        {!myStatus && <button className="rally" onClick={()=>openComposer("rally")}><Megaphone size={15}/> Rally your people</button>}
      </div>

      {myStatus && (
        <div className="livecard">
          <div className="ttl"><span className="livedot"/>{myStatus.rally ? "Rally is out" : `Out · ${myStatus.act.label}`}</div>
          <div className="mt">At <b>{myStatus.loc}</b> · <b className="tnum">{myStatus.time}</b> · fades {myStatus.expire.toLowerCase()}</div>
          <div className="acts">
            <button className="lbtn" onClick={()=>showToast({ title:"Link copied" })}><Share2 size={13}/> Share</button>
            <button className="lbtn" onClick={endShowFace}>End</button>
          </div>
        </div>
      )}

      <div className="sect"><h3>Happening near you</h3><span className="link" onClick={()=>setTab("nearby")}>See all <ChevronRight size={14}/></span></div>
      {meetups.filter(m=>m.day==="today").slice(0,3).map(m=><MeetupCard key={m.id} m={m}/>)}

      <div className="sect"><h3>Who's out</h3><span className="meta">Now</span></div>
      <div className="list">
        {friends.filter(f=>f.live).map(f=>(
          <div className="row" key={f.id}>
            <div className="av">{initials(f.name)}<span className="ld"/></div>
            <div className="body">
              <div className="nm">{f.name}</div>
              <div className="where"><MapPin size={13}/> {f.spot} · <span className="t tnum">{f.time}</span> · <Navigation size={11}/> {f.eta}</div>
            </div>
            <button className={`btn ${joined[f.id]?"fill":""}`} onClick={()=>toggleJoin(f)}>{joined[f.id]?"On the way":"I'm in"}</button>
          </div>
        ))}
      </div>
    </div>
  );

  const Nearby = (
    <div>
      <div className="titlebar"><div className="tt">Nearby</div><div className="tbtn" onClick={()=>setHostSheet(true)}><Plus size={18}/></div></div>
      <p className="sub">Things already happening around you. Just show up.</p>
      <div style={{height:18}}/>

      <div className="filters">
        <button className={`fchip ${filter==="all"?"on":""}`} onClick={()=>setFilter("all")}>All</button>
        {KINDS.map(k=>{ const I=k.icon; return (<button key={k.id} className={`fchip ${filter===k.id?"on":""}`} onClick={()=>setFilter(k.id)}><I size={14}/> {k.label}</button>); })}
      </div>

      {["today","tomorrow","this week"].map(d=>{
        const items = byDay(d);
        if(!items.length) return null;
        return (
          <div key={d}>
            <div className="daylbl">{d}</div>
            {items.map(m=><MeetupCard key={m.id} m={m}/>)}
          </div>
        );
      })}
      {shown.length===0 && <div className="daylbl" style={{textTransform:"none", letterSpacing:0, fontSize:13.5, color:"var(--ink2)", fontWeight:400}}>Nothing here yet — be the one to start it.</div>}

      <div style={{height:14}}/>
      <div className="hostbar" onClick={()=>setHostSheet(true)}>
        <div className="hi"><Plus size={19}/></div>
        <div style={{flex:1}}><div className="ht">Host your own</div><div className="hd">Start a run, a lift, a game — make it weekly</div></div>
        <ChevronRight size={18} color="var(--muted)"/>
      </div>
    </div>
  );

  const Circles = (
    <div>
      <div className="titlebar"><div className="tt">Circles</div><div className="tbtn" onClick={()=>showToast({ title:"Invite link copied" })}><Plus size={18}/></div></div>
      <p className="sub">Choose who sees your light. Tap one to show face to it.</p>
      <div style={{height:18}}/>
      <div className="circ">
        {CIRCLES.map(c=>{ const out = friends.filter(f=>f.live && f.circle===c.id).length; return (
          <div className="ccard" key={c.id} onClick={()=>{ setPickCircles([c.id]); setTab("tonight"); openComposer("normal"); }}>
            <div className="ci">{c.name[0]}</div>
            <div className="cn">{c.name}</div>
            <div className="cc">{c.count} people</div>
            <div className={`cnow ${out?"on":"q"}`}>{out>0 ? `${out} out now` : "quiet"}</div>
          </div>); })}
        <div className="ccard add" onClick={()=>{ if(!isPlus) setPremium(true); }}>{!isPlus && <span className="lockpill"><Lock size={9}/> PLUS</span>}<Plus size={22}/><span style={{fontSize:13, fontWeight:500}}>New circle</span></div>
      </div>
    </div>
  );

  const You = (
    <div>
      <div className="titlebar"><div className="tt">You</div><div className="tbtn" onClick={()=>setPrivacy(true)}><Shield size={17}/></div></div>
      <div className="profile">
        <div className="ptop">
          <div className="pavatar" style={liveAv(!!myStatus)}>{initials(profile.name)}</div>
          <div className="pid">
            <div className="pname">{profile.name}{isPlus && <span className="plusbadge"><Sparkles size={10}/> PLUS</span>}</div>
            <div className="phandle">@{profile.handle}{myStatus && <span className="outnow"><span className="od"/> Out now</span>}</div>
            <div className="ploc"><MapPin size={13}/> {profile.location}</div>
          </div>
        </div>
        <div className="pactions">
          <button className="pbtn" onClick={openEdit}><Pencil size={14}/> Edit profile</button>
          <button className="pbtn" onClick={()=>showToast({ title:"Profile link copied" })}><Share2 size={14}/> Share</button>
        </div>
      </div>

      <div className="stats">
        <div className="s"><div className="v tnum">12</div><div className="k">weeks active</div></div>
        <div className="s"><div className="v tnum">38</div><div className="k">times out</div></div>
        <div className="s"><div className="v tnum">{Object.values(joinedM).filter(Boolean).length}</div><div className="k">meetups joined</div></div>
      </div>

      <div className="sect"><h3>Settings</h3></div>
      <div className="list">
        <div className="settingrow" onClick={()=>setPrivacy(true)}>
          <div><div className="sl"><Shield size={17}/> Privacy</div><div className="sd">Who sees you, and how much</div></div>
          <ChevronRight size={18} color="var(--muted)"/>
        </div>
        <div className="settingrow" onClick={()=>setPremium(true)}>
          <div><div className="sl"><Sparkles size={17}/> ShowFace+</div><div className="sd">{isPlus ? "Member" : "$4.99 / month"}</div></div>
          <ChevronRight size={18} color="var(--muted)"/>
        </div>
      </div>
    </div>
  );

  const SCREENS = { tonight:Tonight, nearby:Nearby, circles:Circles, you:You };

  return (
    <div className="sf">
      <style>{CSS}</style>
      <div className="sf-phone">
        <div className="sf-sb">
          <span className="tnum">9:41</span>
          <span className="r"><span className="bars"><i style={{height:4}}/><i style={{height:6}}/><i style={{height:9}}/><i style={{height:11}}/></span><svg width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M3 7c1.4-1.3 3.2-2 5-2s3.6.7 5 2M.7 4.3C2.8 2.4 5.3 1.4 8 1.4s5.2 1 7.3 2.9" stroke="#141312" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="10.4" r="1.1" fill="#141312"/></svg><span className="batt"/></span>
        </div>

        {toast && (<div className="toast" onClick={()=>setToast(null)}><div className="ti">{toast.rally?<Megaphone size={18}/>:<Check size={16}/>}</div><div style={{flex:1, minWidth:0}}><div className="tt2">{toast.title}</div>{toast.desc && <div className="td">{toast.desc}</div>}</div></div>)}

        <div className="sf-screen"><div className="sf-pad">{SCREENS[tab]}</div></div>

        {/* meetup detail */}
        {detail && (
          <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains("scrim")) setDetail(null); }}>
            <div className="sheet">
              <div className="grab"/>
              <div style={{display:"flex", justifyContent:"flex-end"}}><button className="close" onClick={()=>setDetail(null)}><X size={18}/></button></div>
              <div className="detailhero">
                <div className="dh">
                  <div className="di">{React.createElement(kindOf(detail.kind).icon, { size:23 })}</div>
                  <div><div className="dn">{detail.name}</div><div className="dm">{kindOf(detail.kind).label} · hosted by {detail.host}</div></div>
                </div>
                <div className="drow">
                  <div><div className="dk">When</div><div className="dv">{detail.time}</div></div>
                  <div><div className="dk">Repeats</div><div className="dv">{detail.every}</div></div>
                  <div><div className="dk">Going</div><div className="dv tnum">{detail.going}</div></div>
                </div>
              </div>
              <div className="desc">{detail.desc}</div>
              <div className="fld"><span className="fl">Where</span>
                <div className="mumeta" style={{fontSize:14}}><MapPin size={14}/> {detail.spot} · {detail.dist} away</div>
              </div>
              <div className="fld"><span className="fl">Who's going</span>
                <div className="going"><div className="gstack">{detail.who.slice(0,4).map((w,i)=><div className="mini" key={i}>{w[0]}</div>)}</div><span className="gtext">{detail.who.join(", ")} and <b className="tnum">{Math.max(0, detail.going - detail.who.length)}</b> more</span></div>
              </div>
              <button className="sendbtn" onClick={()=>{ toggleMeetup(detail); setDetail(null); }}>{joinedM[detail.id] ? <><X size={17}/> Leave meetup</> : <><Check size={17}/> Join this meetup</>}</button>
              <button className="ghostwide" onClick={()=>{ showToast({ title:"Invite link copied", desc:detail.name }); setDetail(null); }}><Share2 size={16}/> Invite a friend</button>
            </div>
          </div>
        )}

        {/* host a meetup */}
        {hostSheet && (
          <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains("scrim")) setHostSheet(false); }}>
            <div className="sheet">
              <div className="grab"/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}><div><h2>Host a meetup</h2><div className="shsub">Put it on the map. People can just show up.</div></div><button className="close" onClick={()=>setHostSheet(false)}><X size={18}/></button></div>
              <div className="fld"><span className="fl">What is it</span><div className="chips">{KINDS.map(k=>{ const I=k.icon; return <button key={k.id} className={`chip ${hKind===k.id?"on":""}`} onClick={()=>setHKind(k.id)}><I size={13}/> {k.label}</button>; })}</div></div>
              <div className="fld"><span className="fl">Name</span><input className="pinput" value={hName} onChange={(e)=>setHName(e.target.value)} placeholder={`e.g. ${kindOf(hKind).label} at 6`}/></div>
              <div className="fld"><span className="fl">Where</span><input className="pinput" value={hSpot} onChange={(e)=>setHSpot(e.target.value)} placeholder="Park, gym, studio, address"/></div>
              <div className="fld"><span className="fl">When</span><input className="pinput" value={hTime} onChange={(e)=>setHTime(e.target.value)} placeholder="e.g. 6:30 AM"/></div>
              <div className="switchrow"><div><div className="sl"><Repeat size={15}/> Make it weekly</div><div className="sd">Repeats so people can build it into their week</div></div><div className={`sw ${hRepeat?"on":""}`} onClick={()=>setHRepeat(v=>!v)}/></div>
              <button className="sendbtn" onClick={createMeetup}><Send size={17}/> Post meetup</button>
            </div>
          </div>
        )}

        {composer && (
          <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains("scrim")) setComposer(null); }}>
            <div className="sheet">
              <div className="grab"/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                <div><h2>{composer==="rally"?"Rally your people":"Show your face"}</h2><div className="shsub">{composer==="rally"?"Let everyone know you want them out.":"No event, no RSVP. Just signal you're around."}</div></div>
                <button className="close" onClick={()=>setComposer(null)}><X size={18}/></button>
              </div>
              <div className="fld"><span className="fl">For</span><div className="chips">{KINDS.map(a=>{ const I=a.icon; return <button key={a.id} className={`chip ${pickAct===a.id?"on":""}`} onClick={()=>setPickAct(a.id)}><I size={13}/> {a.label}</button>; })}</div></div>
              <div className="fld"><span className="fl">Where</span><div className="chips">{LOCATIONS.map(l=><button key={l} className={`chip ${pickLoc===l?"on":""}`} onClick={()=>setPickLoc(l)}><MapPin size={13}/> {l}</button>)}</div></div>
              <div className="fld"><span className="fl">When</span><div className="chips">{TIMES.map(t=><button key={t} className={`chip ${pickTime===t?"on":""}`} onClick={()=>setPickTime(t)}><Clock size={13}/> {t}</button>)}</div></div>
              <div className="fld"><span className="fl">Who sees it</span><div className="chips">{CIRCLES.map(c=><button key={c.id} className={`chip ${pickCircles.includes(c.id)?"on":""}`} onClick={()=>toggleCircle(c.id)}>{c.name}</button>)}</div></div>
              <div className="fld"><span className="fl">Fades after</span><div className="chips">{EXPIRES.map(x=><button key={x} className={`chip ${pickExpire===x?"on":""}`} onClick={()=>setPickExpire(x)}><Clock size={13}/> {x}</button>)}</div></div>
              <button className="sendbtn" disabled={pickCircles.length===0} onClick={sendShowFace}>{composer==="rally"?<><Megaphone size={18}/> Send the rally</>:<><Send size={17}/> Show Face</>}</button>
            </div>
          </div>
        )}

        {editP && (
          <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains("scrim")) setEditP(false); }}>
            <div className="sheet">
              <div className="grab"/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}><div><h2>Edit profile</h2><div className="shsub">This is what your circle sees.</div></div><button className="close" onClick={()=>setEditP(false)}><X size={18}/></button></div>
              <div className="peditav"><div className="pavatar">{initials(draftName||profile.name)}</div></div>
              <div className="fld"><span className="fl">Name</span><input className="pinput" value={draftName} onChange={(e)=>setDraftName(e.target.value)} placeholder="Your name"/></div>
              <div className="fld"><span className="fl">Location</span><input className="pinput" value={draftLoc} onChange={(e)=>setDraftLoc(e.target.value)} placeholder="Where you're based"/></div>
              <button className="sendbtn" onClick={saveProfile}><Check size={17}/> Save</button>
            </div>
          </div>
        )}

        {privacy && (
          <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains("scrim")) setPrivacy(false); }}>
            <div className="sheet">
              <div className="grab"/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}><div><h2>Privacy</h2><div className="shsub">You'll share more when you control what's seen.</div></div><button className="close" onClick={()=>setPrivacy(false)}><X size={18}/></button></div>
              <div className="switchrow" style={{marginTop:22}}><div><div className="sl"><MapPin size={15}/> Approximate location</div><div className="sd">Show your area, not your pin</div></div><div className={`sw ${priv.approx?"on":""}`} onClick={()=>setPriv(p=>({...p, approx:!p.approx}))}/></div>
              <div className="switchrow"><div><div className="sl"><EyeOff size={15}/> Hide exact spot</div><div className="sd">Reveal only when you arrive</div></div><div className={`sw ${priv.hide?"on":""}`} onClick={()=>setPriv(p=>({...p, hide:!p.hide}))}/></div>
              <div className="switchrow"><div><div className="sl"><Shield size={15}/> Quiet mode</div><div className="sd">See others, stay unlisted</div></div><div className={`sw ${priv.quiet?"on":""}`} onClick={()=>setPriv(p=>({...p, quiet:!p.quiet}))}/></div>
            </div>
          </div>
        )}

        {premium && (
          <div className="scrim" onClick={(e)=>{ if(e.target.classList.contains("scrim")) setPremium(false); }}>
            <div className="sheet">
              <div className="grab"/>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}><div><h2>ShowFace+</h2><div className="shsub">The free app gets you out. Plus goes further.</div><div className="pp2">$4.99 <span>/ month</span></div></div><button className="close" onClick={()=>setPremium(false)}><X size={18}/></button></div>
              <div className="cmp">{PLUS_FEATURES.map((f,i)=>(<div className="cr" key={i}><span className={`ck ${f.free?"free":"plus"}`}>{f.free?<Check size={12} strokeWidth={2.6}/>:<Sparkles size={11}/>}</span><span className="ct3">{f.t}</span></div>))}</div>
              <button className="sendbtn" onClick={goPlus}>Start free trial</button>
              <div className="premnote">Then $4.99/month. Cancel anytime.</div>
            </div>
          </div>
        )}

        <div className="bnav">
          <button className={`nb ${tab==="tonight"?"act":""}`} onClick={()=>setTab("tonight")}><Home size={21}/>Tonight</button>
          <button className={`nb ${tab==="nearby"?"act":""}`} onClick={()=>setTab("nearby")}><CalendarDays size={21}/>Nearby</button>
          <button className={`nb ${tab==="circles"?"act":""}`} onClick={()=>setTab("circles")}><Users size={21}/>Circles</button>
          <button className={`nb ${tab==="you"?"act":""}`} onClick={()=>setTab("you")}><User size={21}/>You</button>
        </div>
      </div>
    </div>
  );
}
