"use strict";

// ═══════════════════════════════════════════════════════════════════════════════
//  TOP SOVEREIGN v3.0 — Classement visuel ultime (Fix Visuel Pixel-Perfect)
//  Auteur   : Christus x Shade
// ═══════════════════════════════════════════════════════════════════════════════

const fs     = require("fs-extra");
const path   = require("path");
const axios  = require("axios");
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

let fonts;
try { fonts = require("../func/fonts.js"); } catch (_) {}

const f = fonts || {
  bold: t => t, italic: t => t, mono: t => t, gothic: t => t,
  circle: t => t, christus: t => t, developed: t => t, normal: t => t
};

// ─── Polices ──────────────────────────────────────────────────────────────────
if (canvasAvailable && registerFont) {
  const fd = path.join(__dirname, "assets", "font");
  [
    ["BeVietnamPro-Bold.ttf",    "BF", "bold"],
    ["BeVietnamPro-Regular.ttf", "BF", "normal"],
    ["BeVietnamPro-SemiBold.ttf","BF", "600"],
    ["NotoSans-Bold.ttf",        "BF", "bold"],
    ["NotoSans-Regular.ttf",     "BF", "normal"],
  ].forEach(([ft, fam, w]) => {
    try {
      const fp = path.join(fd, ft);
      if (fs.existsSync(fp)) registerFont(fp, { family: fam, weight: w });
    } catch (_) {}
  });
}

// ─── Paliers ──────────────────────────────────────────────────────────────────
const TIERS = [
  { name: "Starter", min: 0,        max: 999,      color: "#CD7F32", sym: "◈" },
  { name: "Rookie",  min: 1_000,    max: 4_999,    color: "#C0C0C0", sym: "◇" },
  { name: "Pro",     min: 5_000,    max: 19_999,   color: "#FFD700", sym: "◆" },
  { name: "Elite",   min: 20_000,   max: 49_999,   color: "#E8E8FF", sym: "◉" },
  { name: "Master",  min: 50_000,   max: 99_999,   color: "#00FFFF", sym: "▣" },
  { name: "Legend",  min: 100_000,  max: 499_999,  color: "#FF00FF", sym: "▲" },
  { name: "GOD",     min: 500_000,  max: Infinity, color: "#FF2020", sym: "◎" },
];

function getTier(balance) {
  const b = Number(balance) || 0;
  return TIERS.find(t => b >= t.min && b <= t.max) || TIERS[0];
}

// ─── Formatage monnaie ────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || isNaN(n)) return "$0";
  n = Number(n);
  if (!isFinite(n)) return "$∞";
  
  // Formatage scientifique propre si la valeur est trop grande pour tenir
  if (Math.abs(n) >= 1e21) {
    return `$${n.toExponential(2).replace("+", "")}Qi`;
  }

  const S = [{v:1e18,s:"Qi"},{v:1e15,s:"Qa"},{v:1e12,s:"T"},{v:1e9,s:"B"},{v:1e6,s:"M"},{v:1e3,s:"K"}];
  const sc = S.find(s => Math.abs(n) >= s.v);
  if (sc) return `${n<0?"-":""}$${(Math.abs(n)/sc.v).toFixed(2).replace(/\.00$/,"")}${sc.s}`;
  
  const p = Math.abs(n).toFixed(2).split(".");
  p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${n<0?"-":""}$${p.join(".")}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  THÈMES VISUELS
// ═══════════════════════════════════════════════════════════════════════════════
const THEMES = {
  obsidian_crown: {
    name:"Obsidian Crown", sym:"◈",
    bg(ctx,W,H){
      ctx.fillStyle="#060610"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(180,140,255,0.045)"; ctx.lineWidth=0.8;
      for(let x=0;x<W;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      [[W*.7,H*.25,"#7B2FFF",400],[W*.2,H*.6,"#FF2FB8",300]].forEach(([gx,gy,gc,gr])=>{
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0,gc+"22");g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      });
    },
    primary:"#B87AFF",accent:"#FF6DD6",gold:"#FFD580",silver:"#D0B0FF",bronze:"#9960FF",
    text:"#FFFFFF",muted:"rgba(255,255,255,0.5)",
    barA:"#7B2FFF",barB:"#FF6DD6",
    card:"rgba(18,10,35,0.92)",border:"#7B2FFF",glow:"#9B50FF",
    row1:"rgba(60,30,100,0.35)",row2:"rgba(40,15,70,0.22)",
  },
  crimson_empire: {
    name:"Crimson Empire", sym:"◆",
    bg(ctx,W,H){
      ctx.fillStyle="#0C0101"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(200,0,0,0.042)"; ctx.lineWidth=1;
      for(let i=0;i<W+H;i+=34){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(0,i);ctx.stroke();}
      [[W*.6,H*.35,"#CC0000",500],[W*.2,H*.65,"#FF4400",360]].forEach(([gx,gy,gc,gr])=>{
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0,gc+"2C");g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      });
    },
    primary:"#FF2020",accent:"#FFD700",gold:"#FFA500",silver:"#FF6060",bronze:"#CC0000",
    text:"#FFE8E8",muted:"rgba(255,232,232,0.5)",
    barA:"#8B0000",barB:"#FF2020",
    card:"rgba(18,2,2,0.95)",border:"#CC0000",glow:"#FF2020",
    row1:"rgba(100,10,10,0.35)",row2:"rgba(65,5,5,0.22)",
  },
  hologram_league: {
    name:"Hologram League", sym:"◑",
    bg(ctx,W,H){
      ctx.fillStyle="#010810"; ctx.fillRect(0,0,W,H);
      [[W*.6,H*.35,"#00FFE0",500],[W*.18,H*.58,"#0088FF",380]].forEach(([gx,gy,gc,gr])=>{
        const g=ctx.createRadialGradient(gx,gy,0,gx,gy,gr);
        g.addColorStop(0,gc+"1A");g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      });
    },
    primary:"#00FFE0",accent:"#0088FF",gold:"#FFD700",silver:"#40CCCC",bronze:"#008888",
    text:"#E0FFFA",muted:"rgba(224,255,250,0.5)",
    barA:"#003344",barB:"#00FFE0",
    card:"rgba(0,10,18,0.97)",border:"#00BBA0",glow:"#00FFE0",
    row1:"rgba(0,50,60,0.35)",row2:"rgba(0,28,36,0.22)",
  }
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
  if(glow){ctx.shadowColor=glow;ctx.shadowBlur=14;}
  ctx.fillStyle=color; ctx.fillText(s,x,y); ctx.restore();
}

function GL(ctx, x1,y1,x2,y2, color, w=1.5) {
  const g=ctx.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,"transparent");g.addColorStop(.5,color);g.addColorStop(1,"transparent");
  ctx.save();ctx.strokeStyle=g;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();
}

function MBAR(ctx, x, y, w, h, pct, colA, colB, glow) {
  ctx.save();ctx.fillStyle="rgba(0,0,0,0.4)";rr(ctx,x,y,w,h,h/2);ctx.fill();ctx.restore();
  const fillW = Math.max(w * Math.min(pct, 1), h);
  if (fillW > 0) {
    const pg=ctx.createLinearGradient(x,y,x+w,y);
    pg.addColorStop(0,colA);pg.addColorStop(1,colB);
    ctx.save();ctx.shadowColor=glow;ctx.shadowBlur=10;ctx.fillStyle=pg;rr(ctx,x,y,fillW,h,h/2);ctx.fill();ctx.restore();
  }
}

function MBORDER(ctx, W, H, t) {
  const P = 18;
  ctx.save();ctx.shadowColor=t.glow;ctx.shadowBlur=20;ctx.strokeStyle=t.border;ctx.lineWidth=2;rr(ctx,P,P,W-P*2,H-P*2,26);ctx.stroke();ctx.restore();
}

async function AVATAR(ctx, avatarImg, cx, cy, R, t) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, Math.PI * 2);
  ctx.strokeStyle = t.primary; ctx.lineWidth = 2;
  ctx.shadowColor = t.glow; ctx.shadowBlur = 12; ctx.stroke();
  ctx.restore();

  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
  ctx.drawImage(avatarImg, cx - R, cy - R, R * 2, R * 2); ctx.restore();
}

async function loadAvatar(uid, name, api) {
  try {
    const userInfo = await api.getUserInfo(uid);
    const avatarUrl = userInfo[uid]?.thumbSrc || `https://graph.facebook.com/${uid}/picture?width=200&height=200`;
    const res = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 8000 });
    return await loadImage(Buffer.from(res.data));
  } catch (_) {
    const cv  = createCanvas(200, 200);
    const ctx = cv.getContext("2d");
    ctx.fillStyle = "#7B2FFF"; ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = "#FFFFFF"; ctx.font = "bold 80px BF, Arial";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText((name || "?").charAt(0).toUpperCase(), 100, 100);
    return await loadImage(cv.toBuffer());
  }
}

function fitText(ctx, text, maxW, sz) {
  ctx.font = `bold ${sz}px BF, Arial`;
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (ctx.measureText(t + "…").width > maxW && t.length > 1) t = t.slice(0, -1);
  return t + "…";
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CANVAS BUILDER
// ═══════════════════════════════════════════════════════════════════════════════
const CW       = 1100;
const PAD      = 30;
const HEADER_H = 100;
const POD_Y    = PAD + HEADER_H + 24;
const POD_CW   = Math.floor((CW - PAD * 2 - 24) / 3);
const POD_CH   = 220;
const LIST_Y   = POD_Y + POD_CH + 52;
const ROW_H    = 76;
const ROW_GAP  = 8;
const FOOT_H   = 88;

function canvasH(rowCount) {
  return LIST_Y + rowCount * (ROW_H + ROW_GAP) + FOOT_H + PAD;
}

const COL_RANK  = PAD;
const COL_AV_CX = PAD + 62 + 28;
const COL_NAME  = PAD + 62 + 28*2 + 14;
const NAME_MAX  = 220;
const COL_BAR   = COL_NAME + NAME_MAX + 20;
const BAR_W     = 200;
const COL_MONEY = CW - PAD;

async function buildCanvas(richList, pageUsers, startIndex, page, totalPages, senderRank, theme, api) {
  const rowCount = pageUsers.length;
  const CH = canvasH(rowCount);
  const canvas = createCanvas(CW, CH);
  const ctx    = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  theme.bg(ctx, CW, CH);
  ctx.save(); ctx.fillStyle = theme.card; rr(ctx, 18, 18, CW - 36, CH - 36, 26); ctx.fill(); ctx.restore();
  MBORDER(ctx, CW, CH, theme);

  // En-tête
  T(ctx, "◇  CLASSEMENT DES RICHES  ◇", CW / 2, PAD + HEADER_H / 2, 38, theme.primary, { align: "center", glow: theme.glow });
  T(ctx, `Page ${page} / ${totalPages}`, CW - PAD - 10, PAD + 35, 14, theme.muted, { align: "right" });
  T(ctx, `${richList.length} membres`, CW - PAD - 10, PAD + 55, 13, theme.muted, { align: "right" });

  T(ctx, "◆ TOP 3 ◆", PAD, POD_Y - 18, 14, theme.muted, { weight: "600" });

  const podium = richList.slice(0, 3);
  const MEDALS = [
    { rank: "I",   color: "#FFD700", glow: "#FFD700" },
    { rank: "II",  color: theme.silver, glow: theme.silver },
    { rank: "III", color: theme.bronze, glow: theme.bronze },
  ];

  for (let i = 0; i < 3; i++) {
    const user = podium[i];
    const med  = MEDALS[i];
    const cx   = PAD + i * (POD_CW + 12) + POD_CW / 2;
    const cy   = POD_Y;

    // Encadrement du podium
    ctx.save();
    ctx.fillStyle = theme.card; rr(ctx, PAD + i * (POD_CW + 12), cy, POD_CW, POD_CH, 18); ctx.fill();
    ctx.strokeStyle = i === 0 ? "#FFD700" : theme.border + "88";
    ctx.lineWidth = i === 0 ? 2 : 1;
    rr(ctx, PAD + i * (POD_CW + 12), cy, POD_CW, POD_CH, 18); ctx.stroke(); ctx.restore();

    // Badge Rang
    const mx = PAD + i * (POD_CW + 12) + 16, my = cy + 14;
    ctx.save(); ctx.fillStyle = med.color; rr(ctx, mx, my, 48, 24, 12); ctx.fill(); ctx.restore();
    T(ctx, med.rank, mx + 24, my + 12, 13, "#000", { align: "center" });

    if (!user) continue;

    const avImg = await loadAvatar(user.userID, user.name, api);
    await AVATAR(ctx, avImg, cx, cy + 75, 42, { ...theme, primary: med.color, glow: med.glow });

    const dispName = fitText(ctx, user.name || "Inconnu", POD_CW - 20, 18);
    T(ctx, dispName, cx, cy + 142, 18, theme.text, { align: "center" });

    const formattedMoney = fitText(ctx, fmt(user.money || 0), POD_CW - 20, 18);
    T(ctx, formattedMoney, cx, cy + 168, 18, theme.primary, { align: "center", glow: theme.glow });

    const tier = getTier(user.money || 0);
    T(ctx, `${tier.sym} ${tier.name}`, cx, cy + 192, 12, tier.color, { align: "center", weight: "600" });
  }

  const SEP_Y = LIST_Y - 26;
  GL(ctx, PAD, SEP_Y, CW - PAD, SEP_Y, theme.border, 1);
  T(ctx, "▣ CLASSEMENT COMPLET ▣", PAD, SEP_Y - 14, 14, theme.muted, { weight: "600" });

  const maxMoney = richList[0]?.money || 1;

  for (let i = 0; i < pageUsers.length; i++) {
    const user  = pageUsers[i];
    const gRank = startIndex + i + 1;
    const rowY  = LIST_Y + i * (ROW_H + ROW_GAP);

    ctx.save(); ctx.fillStyle = i % 2 === 0 ? theme.row1 : theme.row2;
    rr(ctx, PAD, rowY, CW - PAD * 2, ROW_H, 12); ctx.fill(); ctx.restore();

    const rankLabel = gRank === 1 ? "[ I ]" : gRank === 2 ? "[ II ]" : gRank === 3 ? "[ III ]" : `#${gRank}`;
    const rankColor = gRank === 1 ? theme.gold : gRank === 2 ? theme.silver : gRank === 3 ? theme.bronze : theme.muted;
    T(ctx, rankLabel, COL_RANK + 30, rowY + ROW_H / 2, 14, rankColor, { align: "center" });

    const avImg = await loadAvatar(user.userID, user.name, api);
    await AVATAR(ctx, avImg, COL_AV_CX, rowY + ROW_H / 2, 24, { ...theme, primary: rankColor, glow: theme.glow });

    const dn = fitText(ctx, user.name || "Inconnu", NAME_MAX, 18);
    T(ctx, dn, COL_NAME, rowY + ROW_H / 2 - 10, 18, theme.text);

    const tier = getTier(user.money || 0);
    T(ctx, `${tier.sym} ${tier.name}`, COL_NAME, rowY + ROW_H / 2 + 12, 12, tier.color, { weight: "600" });

    const pct = (user.money || 0) / maxMoney;
    MBAR(ctx, COL_BAR, rowY + ROW_H / 2 - 8, BAR_W, 16, pct, theme.barA, theme.barB, theme.glow);
    T(ctx, `${(pct * 100).toFixed(1)}%`, COL_BAR + BAR_W + 10, rowY + ROW_H / 2, 11, theme.muted, { weight: "600" });

    const displayMoney = fitText(ctx, fmt(user.money || 0), 220, 18);
    T(ctx, displayMoney, COL_MONEY, rowY + ROW_H / 2, 18, theme.primary, { align: "right", glow: theme.glow });
  }

  const FT_Y = LIST_Y + pageUsers.length * (ROW_H + ROW_GAP) + 10;
  GL(ctx, PAD, FT_Y, CW - PAD, FT_Y, theme.border, 1);

  if (senderRank > 0) {
    T(ctx, `◆ Votre position : #${senderRank} sur ${richList.length}`, CW / 2, FT_Y + 20, 15, theme.accent, { align: "center", glow: theme.glow });
  }
  T(ctx, "◆ Répondez avec un numéro de page pour naviguer ◆", CW / 2, FT_Y + 42, 13, theme.muted, { align: "center" });
  
  const now = moment().tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm");
  T(ctx, `${now} · Shade`, CW / 2, FT_Y + 62, 12, theme.muted, { align: "center" });

  return canvas;
}

module.exports = {
  config: {
    name:        "top",
    aliases:     ["richest"],
    version:     "3.1",
    author:      "Shade x Christus",
    countDown:   5,
    role:        0,
    description: { fr: "Top Sovereign v3 — Classement des riches." },
    category:    "economy",
    guide: {
      en: "top [page] | top <1-10> pour changer de thème"
    },
  },

  onStart: async function ({ message, event, args, usersData, api }) {
    const { senderID, threadID } = event;
    const PER_PAGE = 10;

    const themeKeys = Object.keys(THEMES);
    const senderUD  = await usersData.get(senderID).catch(() => ({}));
    let themeKey    = senderUD?.topTheme && THEMES[senderUD.topTheme]
      ? senderUD.topTheme
      : themeKeys[0];

    let page = 1;
    for (const a of args) {
      const n = parseInt(a);
      if (!isNaN(n) && n >= 1 && n <= themeKeys.length) { themeKey = themeKeys[n-1]; continue; }
      if (!isNaN(n) && n > 0) page = n;
    }
    const theme = THEMES[themeKey];

    const allUsers   = await usersData.getAll();
    const richList   = allUsers.filter(u => (u.money||0) > 0).sort((a,b) => (b.money||0)-(a.money||0));
    const totalPages = Math.max(1, Math.ceil(richList.length / PER_PAGE));
    page = Math.max(1, Math.min(page, totalPages));

    const startIndex = (page - 1) * PER_PAGE;
    const pageUsers  = richList.slice(startIndex, startIndex + PER_PAGE);
    const senderRank = richList.findIndex(u => u.userID === senderID) + 1;

    if (!pageUsers.length) {
      return message.reply(f.christus("◆ Aucun utilisateur fortuné trouvé."));
    }

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
    const outPath = path.join(cacheDir, `top_${threadID}_${Date.now()}.png`);

    const canvas = await buildCanvas(richList, pageUsers, startIndex, page, totalPages, senderRank, theme, api);
    fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

    const sent = await message.reply({
      body: f.christus(`◈ CLASSEMENT — Page ${page}/${totalPages}\n◆ Thème : ${theme.sym} ${theme.name}`),
      attachment: fs.createReadStream(outPath),
    });

    setTimeout(() => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (_) {} }, 60_000);

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: this.config.name,
      author:      senderID,
      type:        "top_nav",
      totalPages,
      threadID,
      themeKey,
    });
  },

  onReply: async function ({ message, event, Reply, usersData, api }) {
    if (Reply.author !== event.senderID || Reply.type !== "top_nav") return;

    const page = parseInt(event.body);
    if (isNaN(page) || page < 1 || page > Reply.totalPages) {
      return message.reply(f.christus(`◆ Page invalide. Entrez un numéro entre 1 et ${Reply.totalPages}.`));
    }

    const PER_PAGE   = 10;
    const theme      = THEMES[Reply.themeKey] || THEMES[Object.keys(THEMES)[0]];
    const allUsers   = await usersData.getAll();
    const richList   = allUsers.filter(u => (u.money||0) > 0).sort((a,b) => (b.money||0)-(a.money||0));
    const startIndex = (page - 1) * PER_PAGE;
    const pageUsers  = richList.slice(startIndex, startIndex + PER_PAGE);
    const senderRank = richList.findIndex(u => u.userID === event.senderID) + 1;

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
    const outPath = path.join(cacheDir, `top_${Reply.threadID}_${Date.now()}.png`);

    const canvas = await buildCanvas(richList, pageUsers, startIndex, page, Reply.totalPages, senderRank, theme, api);
    fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

    await message.reply({
      body: f.christus(`◈ CLASSEMENT — Page ${page}/${Reply.totalPages}`),
      attachment: fs.createReadStream(outPath),
    });

    setTimeout(() => { try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch (_) {} }, 60_000);

    global.GoatBot.onReply.delete(Reply.messageID);
  },
};
    
