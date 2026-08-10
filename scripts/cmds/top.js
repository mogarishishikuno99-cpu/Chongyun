const fonts = require("../func/fonts.js");
const fs    = require("fs-extra");
const path  = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

let loadImage, createCanvas, registerFont;
let canvasAvailable = false;
try {
  const cv = require("canvas");
  loadImage    = cv.loadImage;
  createCanvas = cv.createCanvas;
  registerFont = cv.registerFont;
  canvasAvailable = true;
} catch (e) { console.error("Canvas indisponible :", e.message); }

// ─── Polices ──────────────────────────────────────────────────────────────────
if (canvasAvailable && registerFont) {
  const fd = path.join(__dirname, "assets", "font");
  [
    ["BeVietnamPro-Bold.ttf",    "BF", "bold"],
    ["BeVietnamPro-Regular.ttf", "BF", "normal"],
    ["BeVietnamPro-SemiBold.ttf","BF", "600"],
    ["NotoSans-Bold.ttf",        "BF", "bold"],
    ["NotoSans-Regular.ttf",     "BF", "normal"],
  ].forEach(([f, fam, w]) => {
    try {
      const fp = path.join(fd, f);
      if (fs.existsSync(fp)) registerFont(fp, { family: fam, weight: w });
    } catch (_) {}
  });
}

const FB_TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

// ─── Formatage monnaie ────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || isNaN(n)) return "$0";
  n = Number(n);
  if (!isFinite(n)) return "$∞";
  const S = [{v:1e18,s:"Qi"},{v:1e15,s:"Qa"},{v:1e12,s:"T"},{v:1e9,s:"B"},{v:1e6,s:"M"},{v:1e3,s:"K"}];
  const sc = S.find(s => Math.abs(n) >= s.v);
  if (sc) return `${n<0?"-":""}$${(Math.abs(n)/sc.v).toFixed(2).replace(/\.00$/,"")}${sc.s}`;
  const p = Math.abs(n).toFixed(2).split(".");
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${n<0?"-":""}$${p.join(".")}`;
}

// ─── Paliers ──────────────────────────────────────────────────────────────────
const TIERS = [
  { name:"Starter", min:0,       max:999,      color:"#CD7F32", sym:"◈" },
  { name:"Rookie",  min:1_000,   max:4_999,    color:"#C0C0C0", sym:"◇" },
  { name:"Pro",     min:5_000,   max:19_999,   color:"#FFD700", sym:"◆" },
  { name:"Elite",   min:20_000,  max:49_999,   color:"#E8E8FF", sym:"◉" },
  { name:"Master",  min:50_000,  max:99_999,   color:"#00FFFF", sym:"▣" },
  { name:"Legend",  min:100_000, max:499_999,  color:"#FF00FF", sym:"▲" },
  { name:"GOD",     min:500_000, max:Infinity,  color:"#FF2020", sym:"◎" },
];
function getTier(b) { return TIERS.find(t => (b||0)>=t.min && (b||0)<=t.max) || TIERS[0]; }

// ═══════════════════════════════════════════════════════════════════════════════
//  10 THÈMES
// ═══════════════════════════════════════════════════════════════════════════════
const THEMES = {
  obsidian_gift: {
    name:"Obsidian Gift", sym:"◈",
    bg(ctx,W,H){
      ctx.fillStyle="#050510"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(180,140,255,0.042)"; ctx.lineWidth=0.8;
      for(let x=0;x<W;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      [[W*.65,H*.4,"#7B2FFF",380],[W*.2,H*.6,"#FF2FB8",300]].forEach(([gx,gy,gc,gr])=>{
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0,gc+"22");g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      });
      for(let i=0;i<55;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.2,0,Math.PI*2);ctx.fillStyle=`rgba(180,140,255,${Math.random()*.32})`;ctx.fill();}
    },
    primary:"#B87AFF",accent:"#FF6DD6",gold:"#FFD580",
    text:"#FFFFFF",muted:"rgba(255,255,255,0.5)",
    card:"rgba(18,10,35,0.93)",border:"#7B2FFF",glow:"#9B50FF",
  },
  solar_gift: {
    name:"Solar Gift", sym:"◉",
    bg(ctx,W,H){
      ctx.fillStyle="#0C0400"; ctx.fillRect(0,0,W,H);
      [[W*.5,0,"#FF8C00",480],[W*.5,H,"#FF3A00",420]].forEach(([gx,gy,gc,gr])=>{
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0,gc+"36");g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      });
      ctx.save();ctx.globalAlpha=0.032;
      for(let a=0;a<360;a+=20){const r=(a*Math.PI)/180;ctx.strokeStyle="#FFB347";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(W*.5,H*.5);ctx.lineTo(W*.5+Math.cos(r)*700,H*.5+Math.sin(r)*700);ctx.stroke();}
      ctx.restore();
      for(let i=0;i<50;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.8,0,Math.PI*2);ctx.fillStyle=`rgba(255,${140+Math.random()*115},0,${Math.random()*.38})`;ctx.fill();}
    },
    primary:"#FF8C00",accent:"#FFE066",gold:"#FFD700",
    text:"#FFF5E0",muted:"rgba(255,245,224,0.5)",
    card:"rgba(22,8,0,0.93)",border:"#FF6600",glow:"#FF8C00",
  },
  arctic_gift: {
    name:"Arctic Gift", sym:"◇",
    bg(ctx,W,H){
      ctx.fillStyle="#010C18"; ctx.fillRect(0,0,W,H);
      [[W*.3,H*.2,"#00BFFF",420],[W*.7,H*.5,"#00FFCC",370],[W*.5,H*.8,"#0066FF",360]].forEach(([gx,gy,gc,gr])=>{
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0,gc+"2A");g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      });
      ctx.strokeStyle="rgba(0,191,255,0.06)"; ctx.lineWidth=0.6;
      for(let i=0;i<18;i++){const fx=Math.random()*W,fy=Math.random()*H,fs=10+Math.random()*22;for(let a=0;a<6;a++){const r=(a*60*Math.PI)/180;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(r)*fs,fy+Math.sin(r)*fs);ctx.stroke();}}
    },
    primary:"#00C8FF",accent:"#00FFCC",gold:"#80DFFF",
    text:"#E8F8FF",muted:"rgba(232,248,255,0.5)",
    card:"rgba(1,12,24,0.94)",border:"#0099BB",glow:"#00C8FF",
  },
  crimson_gift: {
    name:"Crimson Gift", sym:"◆",
    bg(ctx,W,H){
      ctx.fillStyle="#0C0101"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(200,0,0,0.04)"; ctx.lineWidth=1;
      for(let i=0;i<W+H;i+=34){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(0,i);ctx.stroke();}
      [[W*.62,H*.38,"#CC0000",480],[W*.18,H*.62,"#FF4400",350]].forEach(([gx,gy,gc,gr])=>{
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0,gc+"2C");g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      });
      for(let i=0;i<45;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.5,0,Math.PI*2);ctx.fillStyle=`rgba(255,215,0,${Math.random()*.2})`;ctx.fill();}
    },
    primary:"#FF2020",accent:"#FFD700",gold:"#FFA500",
    text:"#FFE8E8",muted:"rgba(255,232,232,0.5)",
    card:"rgba(18,2,2,0.95)",border:"#CC0000",glow:"#FF2020",
  },
  void_gift: {
    name:"Void Gift", sym:"▣",
    bg(ctx,W,H){
      ctx.fillStyle="#000000"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(0,255,65,0.05)"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=22){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=22){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      const g=ctx.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,500);
      g.addColorStop(0,"rgba(0,255,65,0.09)");g.addColorStop(1,"transparent");
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    },
    primary:"#00FF41",accent:"#AAFF80",gold:"#66FF66",
    text:"#CCFFCC",muted:"rgba(204,255,204,0.5)",
    card:"rgba(0,8,0,0.97)",border:"#00AA22",glow:"#00FF41",
  },
  sakura_gift: {
    name:"Sakura Gift", sym:"▲",
    bg(ctx,W,H){
      const g=ctx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,"#180422");g.addColorStop(0.5,"#280A38");g.addColorStop(1,"#180422");
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      for(let i=0;i<16;i++){const px=Math.random()*W,py=Math.random()*H,pr=35+Math.random()*75;const pg=ctx.createRadialGradient(px,py,0,px,py,pr);pg.addColorStop(0,"rgba(255,120,200,0.09)");pg.addColorStop(1,"transparent");ctx.fillStyle=pg;ctx.fillRect(0,0,W,H);}
      [[W*.78,H*.28,"#FF69B4",400],[W*.18,H*.68,"#DA70D6",340]].forEach(([gx,gy,gc,gr])=>{const rg=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);rg.addColorStop(0,gc+"22");rg.addColorStop(1,"transparent");ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);});
    },
    primary:"#FF69B4",accent:"#DA70D6",gold:"#FFB3D9",
    text:"#FFF0F8",muted:"rgba(255,240,248,0.5)",
    card:"rgba(24,4,34,0.94)",border:"#CC3399",glow:"#FF69B4",
  },
  titan_gift: {
    name:"Titan Gift", sym:"◎",
    bg(ctx,W,H){
      ctx.fillStyle="#060606"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(255,140,0,0.036)"; ctx.lineWidth=1;
      for(let i=0;i<W+H;i+=28){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(0,i);ctx.stroke();}
      for(let i=0;i<80;i++){const bx=Math.random()*W,by=H*.5+Math.random()*H*.5;ctx.beginPath();ctx.arc(bx,by,Math.random()*2.5,0,Math.PI*2);ctx.fillStyle=`rgba(255,${70+Math.random()*100},0,${.32+Math.random()*.5})`;ctx.fill();}
      [[W*.5,H,"#FF4500",540],[W*.5,H*.5,"#FF8C00",320]].forEach(([gx,gy,gc,gr])=>{const rg=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);rg.addColorStop(0,gc+"25");rg.addColorStop(1,"transparent");ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);});
    },
    primary:"#FF6600",accent:"#FFB347",gold:"#FFD700",
    text:"#FFF0E0",muted:"rgba(255,240,224,0.5)",
    card:"rgba(12,6,0,0.96)",border:"#BB3300",glow:"#FF6600",
  },
  hologram_gift: {
    name:"Hologram Gift", sym:"◑",
    bg(ctx,W,H){
      ctx.fillStyle="#010810"; ctx.fillRect(0,0,W,H);
      for(let y=0;y<H;y+=3){ctx.fillStyle=`rgba(0,255,200,${.006+Math.random()*.009})`;ctx.fillRect(0,y,W,1.5);}
      [[W*.6,H*.4,"#00FFE0",480],[W*.18,H*.6,"#0088FF",360],[W*.8,H*.7,"#FF00AA",300]].forEach(([gx,gy,gc,gr])=>{const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);g.addColorStop(0,gc+"1A");g.addColorStop(1,"transparent");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);});
    },
    primary:"#00FFE0",accent:"#0088FF",gold:"#80FFEE",
    text:"#E0FFFA",muted:"rgba(224,255,250,0.5)",
    card:"rgba(0,10,18,0.97)",border:"#00BBA0",glow:"#00FFE0",
  },
  phantom_gift: {
    name:"Phantom Gift", sym:"◐",
    bg(ctx,W,H){
      const g=ctx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,"#12032A");g.addColorStop(0.5,"#200840");g.addColorStop(1,"#12032A");
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      [[W*.76,H*.28,"#CC44FF",400],[W*.18,H*.68,"#FF44CC",340]].forEach(([gx,gy,gc,gr])=>{const rg=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);rg.addColorStop(0,gc+"22");rg.addColorStop(1,"transparent");ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);});
    },
    primary:"#CC44FF",accent:"#FF44CC",gold:"#FFAAFF",
    text:"#F8EEFF",muted:"rgba(248,238,255,0.5)",
    card:"rgba(16,2,34,0.96)",border:"#9922CC",glow:"#CC44FF",
  },
  jade_gift: {
    name:"Jade Gift", sym:"✦",
    bg(ctx,W,H){
      ctx.fillStyle="#010F06"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(0,200,100,0.04)"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=46){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+20,H);ctx.stroke();}
      [[W*.42,H*.38,"#00CC66",480],[W*.74,H*.62,"#00FF99",360]].forEach(([gx,gy,gc,gr])=>{const rg=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);rg.addColorStop(0,gc+"24");rg.addColorStop(1,"transparent");ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);});
    },
    primary:"#00FF88",accent:"#00CC66",gold:"#AAFFCC",
    text:"#E0FFE8",muted:"rgba(224,255,232,0.5)",
    card:"rgba(1,12,6,0.96)",border:"#008833",glow:"#00FF88",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PRIMITIVES CANVAS
// ═══════════════════════════════════════════════════════════════════════════════
function rr(ctx, x, y, w, h, r) {
  if (typeof r === "number") r = [r,r,r,r];
  const [tl,tr,br,bl] = r;
  ctx.beginPath();
  ctx.moveTo(x+tl,y); ctx.lineTo(x+w-tr,y); ctx.quadraticCurveTo(x+w,y,x+w,y+tr);
  ctx.lineTo(x+w,y+h-br); ctx.quadraticCurveTo(x+w,y+h,x+w-br,y+h);
  ctx.lineTo(x+bl,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-bl);
  ctx.lineTo(x,y+tl); ctx.quadraticCurveTo(x,y,x+tl,y); ctx.closePath();
}

function T(ctx, s, x, y, sz, color, {align="left",weight="bold",glow=null,alpha=1}={}) {
  ctx.save(); ctx.globalAlpha=alpha;
  ctx.font=`${weight} ${sz}px BF, Arial`;
  ctx.textAlign=align; ctx.textBaseline="middle";
  if(glow){ctx.shadowColor=glow;ctx.shadowBlur=18;}
  ctx.fillStyle=color; ctx.fillText(s,x,y); ctx.restore();
}

function GL(ctx, x1,y1,x2,y2, color, w=1.5) {
  const g=ctx.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,"transparent");g.addColorStop(.5,color);g.addColorStop(1,"transparent");
  ctx.save();ctx.strokeStyle=g;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
}

function MBORDER(ctx, W, H, t) {
  const P=18;
  ctx.save();ctx.shadowColor=t.glow;ctx.shadowBlur=28;ctx.strokeStyle=t.border;ctx.lineWidth=2.2;rr(ctx,P,P,W-P*2,H-P*2,26);ctx.stroke();ctx.restore();
  ctx.save();ctx.strokeStyle=t.accent+"30";ctx.lineWidth=1;rr(ctx,P+5,P+5,W-P*2-10,H-P*2-10,22);ctx.stroke();ctx.restore();
  const L=38;
  [[P,P,1,1],[W-P,P,-1,1],[P,H-P,1,-1],[W-P,H-P,-1,-1]].forEach(([cx,cy,dx,dy])=>{
    ctx.save();ctx.strokeStyle=t.gold;ctx.lineWidth=2.8;ctx.shadowColor=t.gold;ctx.shadowBlur=10;
    ctx.beginPath();ctx.moveTo(cx,cy+dy*L);ctx.lineTo(cx,cy);ctx.lineTo(cx+dx*L,cy);ctx.stroke();ctx.restore();
  });
}

async function loadAvatar(uid, name) {
  try {
    const res = await axios.get(
      `https://graph.facebook.com/${uid}/picture?width=150&height=150&access_token=${FB_TOKEN}`,
      { responseType:"arraybuffer", timeout:8000 }
    );
    return await loadImage(Buffer.from(res.data));
  } catch (_) {
    const cv  = createCanvas(150,150);
    const ctx = cv.getContext("2d");
    const colors = ["#7B2FFF","#FF6600","#00C8FF","#FF2020","#00FF88","#CC44FF","#FFD700"];
    ctx.fillStyle = colors[parseInt(uid||"0") % colors.length];
    ctx.fillRect(0,0,150,150);
    ctx.fillStyle="#FFF"; ctx.font="bold 60px BF, Arial";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText((name||"?").charAt(0).toUpperCase(),75,75);
    return await loadImage(cv.toBuffer());
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CANVAS TOP — 1200 × 700 (5 utilisateurs par page)
// ═══════════════════════════════════════════════════════════════════════════════
const CW = 1200, CH = 700;
const PAD = 30;

async function buildTopCanvas(users, page, totalPages, theme) {
  const canvas = createCanvas(CW, CH);
  const ctx    = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";

  theme.bg(ctx, CW, CH);

  ctx.save();ctx.shadowColor="rgba(0,0,0,0.72)";ctx.shadowBlur=52;ctx.shadowOffsetY=5;
  ctx.fillStyle=theme.card;rr(ctx,18,18,CW-36,CH-36,26);ctx.fill();ctx.restore();

  MBORDER(ctx, CW, CH, theme);

  const HDR_Y = PAD + 42;
  ctx.save();
  const hg=ctx.createLinearGradient(PAD,HDR_Y-20,CW-PAD,HDR_Y+20);
  hg.addColorStop(0,theme.primary);hg.addColorStop(0.5,theme.gold);hg.addColorStop(1,theme.accent);
  ctx.font="bold 36px BF, Arial";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.shadowColor=theme.glow;ctx.shadowBlur=22;ctx.fillStyle=hg;
  ctx.fillText(`◈  CLASSEMENT DES RICHES (PAGE ${page}/${totalPages})  ◈`, CW/2, HDR_Y);ctx.restore();

  GL(ctx, PAD+20, HDR_Y+30, CW-PAD-20, HDR_Y+30, theme.border, 1.2);

  let startY = HDR_Y + 50;
  const rowH = 88;

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const rY = startY + i * rowH;
    const globalRank = (page - 1) * 5 + i + 1;

    ctx.save();
    ctx.fillStyle = globalRank === 1 ? theme.primary + "18" : theme.card;
    rr(ctx, PAD + 20, rY, CW - (PAD + 20) * 2, 74, 14);
    ctx.fill();
    ctx.strokeStyle = globalRank === 1 ? theme.gold + "88" : theme.border + "44";
    ctx.lineWidth = globalRank === 1 ? 1.8 : 1;
    rr(ctx, PAD + 20, rY, CW - (PAD + 20) * 2, 74, 14);
    ctx.stroke();
    ctx.restore();

    let rankDisplay = `#${globalRank}`;
    if (globalRank === 1) rankDisplay = "🥇";
    else if (globalRank === 2) rankDisplay = "🥈";
    else if (globalRank === 3) rankDisplay = "🥉";

    T(ctx, rankDisplay, PAD + 60, rY + 37, globalRank <= 3 ? 24 : 18, theme.text, {align:"center"});

    try {
      const avImg = await loadAvatar(u.uid, u.name);
      ctx.save();
      ctx.beginPath();
      ctx.arc(PAD + 130, rY + 37, 26, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avImg, PAD + 104, rY + 11, 52, 52);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(PAD + 130, rY + 37, 26, 0, Math.PI * 2);
      ctx.strokeStyle = globalRank === 1 ? theme.gold : theme.primary;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } catch (_) {}

    const displayName = u.name.length > 22 ? u.name.slice(0, 20) + "…" : u.name;
    const tier = getTier(u.money);
    T(ctx, displayName, PAD + 180, rY + 26, 20, theme.text, {weight:"bold"});
    T(ctx, `${tier.sym} ${tier.name}`, PAD + 180, rY + 52, 13, tier.color, {glow:tier.color});

    T(ctx, fmt(u.money), CW - PAD - 50, rY + 37, 24, theme.primary, {align:"right", glow:theme.glow});
  }

  const now = moment().tz("Asia/Dhaka").format("DD/MM/YYYY  HH:mm");
  T(ctx, `${theme.sym}  ${now}  ·  Répondez par un chiffre (1 à ${totalPages}) pour changer de page  ·  Shade  ${theme.sym}`, CW/2, CH - PAD - 5, 12, theme.muted, {align:"center", weight:"600"});

  return canvas;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MODULE EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
module.exports = {
  config: {
    name:        "top",
    aliases:     ["richest", "leaderboard", "rich"],
    version:     "3.2",
    author:      "Christus",
    countDown:   5,
    role:        0,
    description: { fr: "◈ Affiche le top des utilisateurs les plus riches avec pagination interactive par onReply." },
    category:    "economy",
    guide: {
      fr: [
        "◈  COMMANDE TOP",
        "",
        "  top                  — Affiche la première page du classement",
        "  top <page>           — Affiche une page spécifique (ex: top 2)",
        "  top theme <1-10>     — Changer le thème de la carte",
      ].join("\n"),
    },
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID } = event;
    const cmd = args[0]?.toLowerCase();

    if (cmd === "theme" && args[1]) {
      const keys = Object.keys(THEMES);
      const n   = parseInt(args[1]);
      const key = (!isNaN(n) && n >= 1 && n <= keys.length) ? keys[n - 1] : args[1].toLowerCase();
      if (THEMES[key]) {
        const ud = await usersData.get(senderID) || {};
        ud.giveTheme = key;
        await usersData.set(senderID, ud);
        return message.reply(fonts.christus(`◈  Thème du top appliqué : ${THEMES[key].sym}  ${THEMES[key].name}`));
      }
      return message.reply(fonts.christus("◆  Thème introuvable. Tapez give themes pour voir la liste."));
    }

    let targetPage = 1;
    if (args[0] && !isNaN(parseInt(args[0]))) {
      targetPage = parseInt(args[0]);
    }

    let allUsers = [];
    try {
      allUsers = await usersData.getAll();
    } catch (_) {}

    if (!allUsers || allUsers.length === 0) {
      return message.reply(fonts.christus("◆  Impossible de récupérer les données des utilisateurs."));
    }

    const sortedUsers = allUsers
      .map(u => ({ uid: u.userID || u.id, name: u.name || "Utilisateur", money: u.money || 0 }))
      .sort((a, b) => b.money - a.money);

    if (sortedUsers.length === 0) {
      return message.reply(fonts.christus("◆  Aucun classement disponible pour le moment."));
    }

    const totalPages = Math.ceil(sortedUsers.length / 5);
    if (targetPage < 1) targetPage = 1;
    if (targetPage > totalPages) targetPage = totalPages;

    const startIndex = (targetPage - 1) * 5;
    const pageUsers = sortedUsers.slice(startIndex, startIndex + 5);

    const themeKeys = Object.keys(THEMES);
    const senderUD  = await usersData.get(senderID).catch(() => ({}));
    let themeKey    = senderUD?.giveTheme && THEMES[senderUD.giveTheme]
      ? senderUD.giveTheme
      : themeKeys[Math.floor(Math.random() * themeKeys.length)];
    const theme = THEMES[themeKey];

    if (!canvasAvailable) {
      let txt = `◈  CLASSEMENT DES RICHES (PAGE ${targetPage}/${totalPages})\n${"─".repeat(30)}\n`;
      pageUsers.forEach((u, i) => {
        const globalRank = startIndex + i + 1;
        txt += `#${globalRank} - ${u.name} : ${fmt(u.money)}\n`;
      });
      txt += `\nRépondez à ce message par le numéro de la page (1 à ${totalPages}) pour naviguer.`;
      const sent = await message.reply(fonts.christus(txt));
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        author: senderID
      });
      return;
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
    const outPath = path.join(cacheDir, `top_${senderID}_${Date.now()}.png`);

    const cvs = await buildTopCanvas(pageUsers, targetPage, totalPages, theme);
    fs.writeFileSync(outPath, cvs.toBuffer("image/png"));

    const body = fonts.christus(`◈  Classement général - Page ${targetPage} sur ${totalPages}\n💡 Répondez directement à ce message avec le numéro d'une page (ex: 2) pour changer de page.`);
    const sent = await message.reply({ body, attachment: fs.createReadStream(outPath) });
    
    global.GoatBot.onReply.set(sent.messageID, {
      commandName: this.config.name,
      author: senderID
    });

    setTimeout(() => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (_) {} }, 30_000);
  },

  onReply: async function ({ api, event, Reply, message, usersData }) {
    if (event.senderID !== Reply.author) return;

    const userInput = event.body ? event.body.trim() : "";
    const requestedPage = parseInt(userInput);

    if (isNaN(requestedPage)) {
      return message.reply(fonts.christus("◆  Veuillez répondre uniquement par un numéro de page valide (ex: 2)."));
    }

    let allUsers = [];
    try {
      allUsers = await usersData.getAll();
    } catch (_) {}

    if (!allUsers || allUsers.length === 0) {
      return message.reply(fonts.christus("◆  Impossible de récupérer les données des utilisateurs."));
    }

    const sortedUsers = allUsers
      .map(u => ({ uid: u.userID || u.id, name: u.name || "Utilisateur", money: u.money || 0 }))
      .sort((a, b) => b.money - a.money);

    const totalPages = Math.ceil(sortedUsers.length / 5);
    if (requestedPage < 1 || requestedPage > totalPages) {
      return message.reply(fonts.christus(`◆  Page invalide. Veuillez choisir un numéro entre 1 et ${totalPages}.`));
    }

    const startIndex = (requestedPage - 1) * 5;
    const pageUsers = sortedUsers.slice(startIndex, startIndex + 5);

    const themeKeys = Object.keys(THEMES);
    const senderUD  = await usersData.get(event.senderID).catch(() => ({}));
    let themeKey    = senderUD?.giveTheme && THEMES[senderUD.giveTheme]
      ? senderUD.giveTheme
      : themeKeys[Math.floor(Math.random() * themeKeys.length)];
    const theme = THEMES[themeKey];

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
    const outPath = path.join(cacheDir, `top_${event.senderID}_${Date.now()}.png`);

    const cvs = await buildTopCanvas(pageUsers, requestedPage, totalPages, theme);
    fs.writeFileSync(outPath, cvs.toBuffer("image/png"));

    const body = fonts.christus(`◈  Classement général - Page ${requestedPage} sur ${totalPages}\n💡 Répondez à nouveau avec un autre numéro pour changer de page.`);
    const sent = await message.reply({ body, attachment: fs.createReadStream(outPath) });

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: this.config.name,
      author: event.senderID
    });

    setTimeout(() => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (_) {} }, 30_000);
  }
};
