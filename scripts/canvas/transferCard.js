const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Charger une police d'aspect technique/clean
try {
  const fontPath = path.join(__dirname, "fonts", "RobotoMono-Bold.ttf");
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: "QuantumFont" });
  }
} catch (e) {
  console.warn("Police personnalisée non chargée, utilisation de sans-serif par défaut.");
}

const FONT_FAMILY = '"QuantumFont", "Courier New", monospace, sans-serif';

/**
 * Formate les montants sous forme abrégée ($13.11K, $5.00)
 */
function formatAmount(val) {
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(2)}K`;
  }
  return `$${val.toFixed(2)}`;
}

/**
 * Génère la carte de transfert
 */
async function createTransferCard({
  senderName = "YUKI",
  senderTag = "30 48",
  senderRank = "[I] Starter",
  senderBalanceAfter = 5.0,
  senderAvatar,

  receiverName = "Kai.",
  receiverTag = "30 FE 59 1C",
  receiverRank = "[III] Pro",
  receiverBalanceAfter = 13230,
  receiverAvatar,

  amount = 13110,
  date = "29.07.2026 15:53",
  systemName = "SHADE QUANTUM"
}) {
  const W = 900;
  const H = 1000;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // =========================================================================
  // 1. FOND SOMBRE NET
  // =========================================================================
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W);
  bgGrad.addColorStop(0, "#061221");
  bgGrad.addColorStop(0.6, "#030a13");
  bgGrad.addColorStop(1, "#010408");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // =========================================================================
  // 2. EN-TÊTE DE LA CARTE
  // =========================================================================
  ctx.fillStyle = "#83d9ff";
  ctx.font = `22px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText("::  TRANSFERT QUANTIQUE  ::", W / 2, 55);

  // =========================================================================
  // 3. FONCTION DE DESSIN DE PANNEAU JOUEUR
  // =========================================================================
  const drawPlayerCard = async (y, title, name, tag, rank, balanceAfter, avatarUrl, isOrangeRank) => {
    const cardW = 810;
    const cardH = 220;
    const x = (W - cardW) / 2;

    ctx.save();

    // Fond du panneau semi-transparent
    ctx.fillStyle = "rgba(4, 20, 38, 0.75)";
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 212, 255, 0.4)";
    ctx.shadowBlur = 12;

    // Rectangle avec angles légèrement arrondis
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 16);
    ctx.fill();
    ctx.stroke();

    // Coincés décoratifs HUD (Coins blancs/bleus)
    const drawCorner = (cx, cy, rotX, rotY) => {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(cx + rotX * 20, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + rotY * 20);
      ctx.stroke();
    };

    drawCorner(x + 18, y + 18, 1, 1);
    drawCorner(x + cardW - 18, y + 18, -1, 1);
    drawCorner(x + 18, y + cardH - 18, 1, -1);
    drawCorner(x + cardW - 18, y + cardH - 18, -1, -1);

    // Titre d'entité centré en haut du panneau
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#3b7d9c";
    ctx.font = `12px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.fillText(`[->>] ${title}`, W / 2, y + 30);

    // --- AVATAR CIRCULAIRE AVEC DOUBLE CERCLAGE ---
    const avX = x + 115;
    const avY = y + cardH / 2 + 5;
    const avRadius = 60;

    // Cercles d'ambiance de l'avatar
    ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Image de l'avatar
    try {
      if (avatarUrl) {
        const img = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX, avY, avRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
        ctx.restore();
      }
    } catch (e) {
      console.error("Erreur de chargement d'avatar:", e);
    }

    // --- TEXTES DES INFOS JOUEUR ---
    const textX = avX + avRadius + 35;

    // Nom d'utilisateur
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 28px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.fillText(name, textX, y + 95);

    // Petit tag/id à droite du nom
    if (tag) {
      const nameWidth = ctx.measureText(name).width;
      ctx.fillStyle = "#5c9bb5";
      ctx.font = `12px ${FONT_FAMILY}`;
      ctx.fillText(`[${tag}]`, textX + nameWidth + 12, y + 85);
    }

    // Rang / Grade
    ctx.fillStyle = isOrangeRank ? "#ff9d00" : "#dca000";
    ctx.font = `bold 16px ${FONT_FAMILY}`;
    ctx.fillText(rank, textX, y + 125);

    // Libellé "SOLDE APRES :"
    ctx.fillStyle = "#5c9bb5";
    ctx.font = `12px ${FONT_FAMILY}`;
    ctx.fillText("SOLDE APRES :", textX, y + 155);

    // Montant du solde
    ctx.fillStyle = "#7ee0ff";
    ctx.font = `bold 22px ${FONT_FAMILY}`;
    ctx.fillText(formatAmount(balanceAfter), textX, y + 185);

    ctx.restore();
  };

  // Dessiner Émetteur & Récepteur
  await drawPlayerCard(90, "EMETTEUR", senderName, senderTag, senderRank, senderBalanceAfter, senderAvatar, false);
  await drawPlayerCard(660, "RECEPTEUR", receiverName, receiverTag, receiverRank, receiverBalanceAfter, receiverAvatar, true);

  // =========================================================================
  // 4. AXE CENTRAL & NOYAU FLOTTANT
  // =========================================================================
  const centerX = W / 2;
  const centerY = H / 2;

  // Segment rectangulaire sous le cercle (Passage de flux)
  ctx.save();
  ctx.fillStyle = "rgba(0, 180, 255, 0.1)";
  ctx.strokeStyle = "rgba(0, 212, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.fillRect(centerX - 30, 310, 60, 350);
  ctx.strokeRect(centerX - 30, 310, 60, 350);

  // Flèche indicatrice de flux dans la bande
  ctx.fillStyle = "#83d9ff";
  ctx.beginPath();
  ctx.moveTo(centerX, 338);
  ctx.lineTo(centerX - 10, 328);
  ctx.lineTo(centerX + 10, 328);
  ctx.closePath();
  ctx.fill();

  // Cercles concentriques du noyau central
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 20;

  ctx.fillStyle = "#030c18";
  ctx.strokeStyle = "#83d9ff";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(centerX, centerY, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cercle intérieur fin
  ctx.strokeStyle = "rgba(0, 212, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
  ctx.stroke();

  // Multiples points lumineux sur le contour du cercle
  const dotsAngle = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  dotsAngle.forEach((angle) => {
    const px = centerX + 110 * Math.cos(angle);
    const py = centerY + 110 * Math.sin(angle);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Textes du noyau central
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#4a8ca8";
  ctx.font = `12px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText("TRANSMIS", centerX, centerY - 40);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 36px ${FONT_FAMILY}`;
  ctx.fillText(formatAmount(amount), centerX, centerY + 10);

  ctx.fillStyle = "#4a8ca8";
  ctx.font = `12px ${FONT_FAMILY}`;
  ctx.fillText("[ VERIFIED ]", centerX, centerY + 50);

  ctx.restore();

  // =========================================================================
  // 5. PIED DE PAGE HAUTE PRÉCISION
  // =========================================================================
  ctx.save();
  ctx.fillStyle = "#2c5b73";
  ctx.font = `13px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText(`:: ICE CRYSTAL // ${date} // ${systemName}`, W / 2, H - 35);
  ctx.restore();

  return canvas.toBuffer("image/png");
}

module.exports = { createTransferCard };
