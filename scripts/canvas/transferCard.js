const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Chargement de la police d'aspect technique
try {
  const fontPath = path.join(__dirname, "fonts", "RobotoMono-Bold.ttf");
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: "QuantumFont" });
  }
} catch (e) {
  console.warn("Police non chargée, utilisation du fallback.");
}

const FONT_FAMILY = '"QuantumFont", "Roboto Mono", "Courier New", monospace';

/**
 * Formate les montants sous forme propre ($13.11K, $5.00)
 */
function formatAmount(val) {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(2)}K`;
  return `$${val.toFixed(2)}`;
}

/**
 * Trace un contour biseauté HUD clean (compatible node-canvas sans roundRect)
 */
function drawBeveledPath(ctx, x, y, width, height, cut) {
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + width - cut, y);
  ctx.lineTo(x + width, y + cut);
  ctx.lineTo(x + width, y + height - cut);
  ctx.lineTo(x + width - cut, y + height);
  ctx.lineTo(x + cut, y + height);
  ctx.lineTo(x, y + height - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
}

/**
 * Génère la carte de transfert au style HUD minimaliste et épuré (9.9/10)
 */
async function createTransferCard({
  senderName = "YUKI",
  senderTag = "30 48",
  senderRank = "[I] Starter",
  senderBalanceBefore = 13115.0,
  senderBalanceAfter = 5.0,
  senderAvatar,
  receiverName = "Kai.",
  receiverTag = "30 FE 59 1C",
  receiverRank = "[III] Pro",
  receiverBalanceBefore = 120.0,
  receiverBalanceAfter = 13230.0,
  receiverAvatar,
  amount = 13110,
  date = "29.07.2026 15:53",
  systemName = "CHRISTUS QUANTUM"
}) {
  const W = 900;
  const H = 1000;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const centerX = W / 2;
  const centerY = H / 2;

  // =========================================================================
  // 1. ARRIÈRE-PLAN SOMBRE AVEC HALO LÉGER
  // =========================================================================
  const bgGrad = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, W * 0.7);
  bgGrad.addColorStop(0, "#061526");
  bgGrad.addColorStop(0.6, "#020a14");
  bgGrad.addColorStop(1, "#010408");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Grille arrière-plan très discrète
  ctx.strokeStyle = "rgba(0, 212, 255, 0.02)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x <= W; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // =========================================================================
  // 2. CONTOUR HUD EXTERIEUR ET 4 COINS LUMINEUX
  // =========================================================================
  ctx.strokeStyle = "rgba(0, 212, 255, 0.35)";
  ctx.lineWidth = 1.5;
  drawBeveledPath(ctx, 20, 20, W - 40, H - 40, 16);
  ctx.stroke();

  // Rendu des 4 coins lumineux
  const drawCorner = (x, y, scaleX, scaleY) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(0, 0);
    ctx.lineTo(25, 0);
    ctx.stroke();
    ctx.restore();
  };
  drawCorner(28, 28, 1, 1);
  drawCorner(W - 28, 28, -1, 1);
  drawCorner(28, H - 28, 1, -1);
  drawCorner(W - 28, H - 28, -1, -1);

  // Ligne verticale de liaison centrale
  ctx.strokeStyle = "rgba(0, 212, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX, 275);
  ctx.lineTo(centerX, H - 275);
  ctx.stroke();

  // =========================================================================
  // 3. PANNEAUX ÉMETTEUR & RÉCEPTEUR
  // =========================================================================
  const drawPlayerCard = async (y, title, name, tag, rank, balanceBefore, balanceAfter, avatarUrl, isReceiver) => {
    const cardW = 820;
    const cardH = 200;
    const x = (W - cardW) / 2;

    ctx.save();
    // Arrière-plan style verre semi-transparent
    ctx.fillStyle = "rgba(4, 18, 34, 0.82)";
    ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(0, 212, 255, 0.2)";
    ctx.shadowBlur = 8;
    drawBeveledPath(ctx, x, y, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Badge titre (ÉMETTEUR / RÉCEPTEUR)
    ctx.fillStyle = "rgba(131, 217, 255, 0.6)";
    ctx.font = `bold 11px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.fillText(`[ ${title} ]`, x + 30, y + 28);

    // --- AVATAR CIRCULAIRE ---
    const avX = x + 100;
    const avY = y + cardH / 2 + 5;
    const avRadius = 52;

    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius, 0, Math.PI * 2);
    ctx.clip();
    try {
      if (avatarUrl) {
        const img = await loadImage(avatarUrl);
        ctx.drawImage(img, avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
      } else {
        ctx.fillStyle = "#0a2238";
        ctx.fillRect(avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
      }
    } catch (e) {
      ctx.fillStyle = "#0a2238";
      ctx.fillRect(avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
    }
    ctx.restore();

    // --- TEXTES & BALANCES ---
    const textX = avX + avRadius + 30;

    // Nom principal
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 26px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.fillText(name, textX, y + 72);

    // Tag
    if (tag) {
      const nameWidth = ctx.measureText(name).width;
      ctx.fillStyle = "#4a8ca8";
      ctx.font = `12px ${FONT_FAMILY}`;
      ctx.fillText(`[${tag}]`, textX + nameWidth + 12, y + 70);
    }

    // Rang
    ctx.fillStyle = isReceiver ? "#00d4ff" : "#ffb700";
    ctx.font = `bold 13px ${FONT_FAMILY}`;
    ctx.fillText(rank, textX, y + 98);

    // Ligne de séparation interne
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(textX, y + 112);
    ctx.lineTo(x + cardW - 30, y + 112);
    ctx.stroke();

    // Affichage des deux soldes (Previous & Updated Balance)
    ctx.fillStyle = "#5c9bb5";
    ctx.font = `11px ${FONT_FAMILY}`;
    ctx.fillText("PREVIOUS BALANCE:", textX, y + 140);
    ctx.fillStyle = "#a2cde0";
    ctx.font = `bold 15px ${FONT_FAMILY}`;
    ctx.fillText(formatAmount(balanceBefore), textX + 150, y + 140);

    ctx.fillStyle = "#5c9bb5";
    ctx.font = `11px ${FONT_FAMILY}`;
    ctx.fillText("UPDATED BALANCE:", textX, y + 168);
    ctx.fillStyle = "#00d4ff";
    ctx.font = `bold 18px ${FONT_FAMILY}`;
    ctx.shadowColor = "rgba(0, 212, 255, 0.4)";
    ctx.shadowBlur = 6;
    ctx.fillText(formatAmount(balanceAfter), textX + 150, y + 168);
    ctx.shadowBlur = 0;

    ctx.restore();
  };

  await drawPlayerCard(75, "ÉMETTEUR", senderName, senderTag, senderRank, senderBalanceBefore, senderBalanceAfter, senderAvatar, false);
  await drawPlayerCard(725, "RÉCEPTEUR", receiverName, receiverTag, receiverRank, receiverBalanceBefore, receiverBalanceAfter, receiverAvatar, true);

  // =========================================================================
  // 4. CERCLE CENTRAL ÉPURÉ (2 ANNEAUX, 4 POINTS, MONTANT)
  // =========================================================================
  ctx.save();
  const radius = 95;

  // Halo très doux en fond
  const coreGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius + 25);
  coreGlow.addColorStop(0, "rgba(0, 212, 255, 0.18)");
  coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 25, 0, Math.PI * 2);
  ctx.fill();

  // Fond du disque
  ctx.fillStyle = "#030c18";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();

  // Anneau 1 : Bordure principale
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 2.5;
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Anneau 2 : Anneau interne fin
  ctx.strokeStyle = "rgba(0, 212, 255, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
  ctx.stroke();

  // 4 Points lumineux cardinaux
  const dotsAngle = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  dotsAngle.forEach((angle) => {
    const px = centerX + radius * Math.cos(angle);
    const py = centerY + radius * Math.sin(angle);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // Libellé et Montant transféré au centre
  ctx.fillStyle = "#4a8ca8";
  ctx.font = `10px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText("MONTANT TRANSMIS", centerX, centerY - 22);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 30px ${FONT_FAMILY}`;
  ctx.shadowColor = "rgba(0, 212, 255, 0.6)";
  ctx.shadowBlur = 8;
  ctx.fillText(formatAmount(amount), centerX, centerY + 14);
  ctx.shadowBlur = 0;

  ctx.restore();

  // =========================================================================
  // 5. PIED DE PAGE
  // =========================================================================
  ctx.save();
  ctx.fillStyle = "rgba(74, 140, 168, 0.5)";
  ctx.font = `11px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText(`:: ${systemName} // ${date} ::`, centerX, H - 32);
  ctx.restore();

  return canvas.toBuffer("image/png");
}

module.exports = { createTransferCard };
