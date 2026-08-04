const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// -------------------------------------------------------------------------
// CHARGEMENT ET CONFIGURATION DE LA POLICE
// -------------------------------------------------------------------------
try {
  const fontPath = path.join(__dirname, "fonts", "RobotoMono-Bold.ttf");
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: "QuantumFont" });
  }
} catch (e) {
  console.warn("Police personnalisée non chargée, utilisation du fallback.");
}

const FONT_FAMILY = '"QuantumFont", "Roboto Mono", "Courier New", monospace';

// -------------------------------------------------------------------------
// UTILITAIRES DE RENDU & MATHÉMATIQUES
// -------------------------------------------------------------------------

/**
 * Formate les montants sous forme réelle avec séparateurs de milliers
 */
function formatAmount(val) {
  const num = Number(val) || 0;
  return `${num.toLocaleString("fr-FR")} $`;
}

/**
 * Alternative compatible à ctx.roundRect
 */
function drawRoundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Trace un panneau HUD avec coins biseautés
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
 * Générateur pseudo-aléatoire déterministe
 */
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// -------------------------------------------------------------------------
// MOTEUR DE GÉNÉRATION DU VISUEL AAA
// -------------------------------------------------------------------------

async function createTransferCard(data = {}) {
  const {
    senderName = "EXPÉDITEUR",
    senderTag = "",
    senderRank = "STARTER",
    senderBalanceBefore = 0,
    senderBalanceAfter = 0,
    senderAvatar,
    receiverName = "DESTINATAIRE",
    receiverTag = "",
    receiverRank = "PRO",
    receiverBalanceBefore = 0,
    receiverBalanceAfter = 0,
    receiverAvatar,
    amount = 0,
    date = "04.08.2026 17:00",
    transactionId = "TX-000000",
    systemName = "SHADE QUANTUM"
  } = data;

  const W = 900;
  const H = 1000;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const centerX = W / 2;
  const centerY = H / 2;

  // =========================================================================
  // 1. ARRIÈRE-PLAN MULTI-COUCHE
  // =========================================================================

  const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, W * 0.85);
  bgGrad.addColorStop(0.0, "#081d33");
  bgGrad.addColorStop(0.4, "#030e1a");
  bgGrad.addColorStop(0.75, "#01060d");
  bgGrad.addColorStop(1.0, "#000205");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Halos lumineux d'ambiance
  const auraGlow1 = ctx.createRadialGradient(centerX, centerY - 150, 10, centerX, centerY - 150, 350);
  auraGlow1.addColorStop(0, "rgba(0, 212, 255, 0.12)");
  auraGlow1.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGlow1;
  ctx.fillRect(0, 0, W, H);

  const auraGlow2 = ctx.createRadialGradient(centerX, centerY + 150, 10, centerX, centerY + 150, 350);
  auraGlow2.addColorStop(0, "rgba(0, 150, 255, 0.08)");
  auraGlow2.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGlow2;
  ctx.fillRect(0, 0, W, H);

  // Grille micro-perspective en fond
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x <= W; x += gridSize) {
    ctx.strokeStyle = x % (gridSize * 4) === 0 ? "rgba(0, 212, 255, 0.07)" : "rgba(0, 212, 255, 0.02)";
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += gridSize) {
    ctx.strokeStyle = y % (gridSize * 4) === 0 ? "rgba(0, 212, 255, 0.07)" : "rgba(0, 212, 255, 0.02)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Particules quantiques
  let seed = 42;
  for (let i = 0; i < 90; i++) {
    const px = seededRandom(seed++) * W;
    const py = seededRandom(seed++) * H;
    const pSize = seededRandom(seed++) * 2 + 0.5;
    const pAlpha = seededRandom(seed++) * 0.5 + 0.1;

    ctx.fillStyle = `rgba(0, 225, 255, ${pAlpha})`;
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = pSize * 4;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // =========================================================================
  // 2. CADRE EXTÉRIEUR HUD
  // =========================================================================

  ctx.strokeStyle = "rgba(0, 212, 255, 0.25)";
  ctx.lineWidth = 2;
  drawBeveledPath(ctx, 15, 15, W - 30, H - 30, 25);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0, 212, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 10;
  drawBeveledPath(ctx, 22, 22, W - 44, H - 44, 20);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const drawCornerHUD = (x, y, scaleX, scaleY) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);

    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 35);
    ctx.lineTo(0, 0);
    ctx.lineTo(35, 0);
    ctx.stroke();

    ctx.fillStyle = "#83d9ff";
    ctx.fillRect(5, 5, 4, 4);

    ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 0); ctx.lineTo(60, 0);
    ctx.moveTo(0, 40); ctx.lineTo(0, 60);
    ctx.stroke();

    ctx.restore();
  };

  drawCornerHUD(30, 30, 1, 1);
  drawCornerHUD(W - 30, 30, -1, 1);
  drawCornerHUD(30, H - 30, 1, -1);
  drawCornerHUD(W - 30, H - 30, -1, -1);

  // =========================================================================
  // 3. EN-TÊTE
  // =========================================================================

  ctx.save();
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 22px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText(":: CANAL DE TRANSFERT QUANTIQUE ::", centerX, 58);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(0, 212, 255, 0.5)";
  ctx.font = `10px ${FONT_FAMILY}`;
  ctx.fillText(`SYS.LOC: NETWORK // ${transactionId}`, centerX, 74);

  const headGrad = ctx.createLinearGradient(centerX - 250, 0, centerX + 250, 0);
  headGrad.addColorStop(0, "rgba(0, 212, 255, 0)");
  headGrad.addColorStop(0.2, "#00d4ff");
  headGrad.addColorStop(0.5, "#ffffff");
  headGrad.addColorStop(0.8, "#00d4ff");
  headGrad.addColorStop(1, "rgba(0, 212, 255, 0)");

  ctx.strokeStyle = headGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX - 250, 85);
  ctx.lineTo(centerX + 250, 85);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 4. LIGNES DE FLUX CENTRALES
  // =========================================================================

  ctx.save();
  const beamGrad = ctx.createLinearGradient(0, 280, 0, H - 280);
  beamGrad.addColorStop(0, "rgba(0, 212, 255, 0.8)");
  beamGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
  beamGrad.addColorStop(1, "rgba(0, 212, 255, 0.8)");

  ctx.strokeStyle = beamGrad;
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 12;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, 280);
  ctx.lineTo(centerX, H - 280);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(0, 212, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(centerX - 12, 280); ctx.lineTo(centerX - 12, H - 280);
  ctx.moveTo(centerX + 12, 280); ctx.lineTo(centerX + 12, H - 280);
  ctx.stroke();
  ctx.setLineDash([]);

  [330, 360, H - 360, H - 330].forEach((nodeY) => {
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, nodeY, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // =========================================================================
  // 5. AFFICHAGE DES CARTES JOUEURS
  // =========================================================================

  const drawPlayerCard = async (y, title, name, tag, rank, balanceBefore, balanceAfter, avatarUrl, isReceiver) => {
    const cardW = 830;
    const cardH = 200;
    const x = (W - cardW) / 2;

    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = "#020914";
    drawBeveledPath(ctx, x, y, cardW, cardH, 15);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const panelGrad = ctx.createLinearGradient(x, y, x + cardW, y + cardH);
    panelGrad.addColorStop(0, "rgba(8, 28, 50, 0.85)");
    panelGrad.addColorStop(0.5, "rgba(4, 18, 34, 0.75)");
    panelGrad.addColorStop(1, "rgba(2, 11, 22, 0.9)");
    ctx.fillStyle = panelGrad;
    drawBeveledPath(ctx, x, y, cardW, cardH, 15);
    ctx.fill();

    const glassGrad = ctx.createLinearGradient(x, y, x, y + 60);
    glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
    glassGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glassGrad;
    drawBeveledPath(ctx, x, y, cardW, cardH, 15);
    ctx.fill();

    ctx.strokeStyle = isReceiver ? "rgba(0, 212, 255, 0.6)" : "rgba(255, 215, 0, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = isReceiver ? "#00d4ff" : "#ffd700";
    ctx.shadowBlur = 10;
    drawBeveledPath(ctx, x, y, cardW, cardH, 15);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Badge Titre HUD
    ctx.fillStyle = isReceiver ? "rgba(0, 212, 255, 0.2)" : "rgba(255, 215, 0, 0.15)";
    ctx.fillRect(x + 20, y + 16, 170, 22);
    ctx.strokeStyle = isReceiver ? "rgba(0, 212, 255, 0.4)" : "rgba(255, 215, 0, 0.4)";
    ctx.strokeRect(x + 20, y + 16, 170, 22);

    ctx.fillStyle = isReceiver ? "#83d9ff" : "#ffd700";
    ctx.font = `bold 11px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.fillText(`// ${title}`, x + 105, y + 31);

    // Avatar
    const avX = x + 100;
    const avY = y + cardH / 2 + 12;
    const avRadius = 48;

    ctx.strokeStyle = isReceiver ? "#00d4ff" : "#ffd700";
    ctx.lineWidth = 2;
    ctx.shadowColor = isReceiver ? "#00d4ff" : "#ffd700";
    ctx.shadowBlur = 8;
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
        ctx.fillStyle = "#071d36";
        ctx.fillRect(avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
      }
    } catch (e) {
      ctx.fillStyle = "#071d36";
      ctx.fillRect(avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
    }
    ctx.restore();

    // Informations Textuelles
    const textX = avX + avRadius + 30;

    // Nom du joueur
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 24px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    const truncatedName = name.length > 14 ? name.substring(0, 12) + "..." : name;
    ctx.fillText(truncatedName, textX, y + 68);

    // Rang / Grade
    ctx.fillStyle = isReceiver ? "#00d4ff" : "#ffd700";
    ctx.font = `bold 12px ${FONT_FAMILY}`;
    ctx.fillText(`RANG : ${rank}`, textX, y + 90);

    // Ligne séparatrice
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(textX, y + 105);
    ctx.lineTo(x + cardW - 30, y + 105);
    ctx.stroke();

    // Détails des Soldes (Propre et aligné)
    ctx.font = `12px ${FONT_FAMILY}`;
    ctx.fillStyle = "#8a99ad";
    ctx.fillText("ANCIEN SOLDE :", textX, y + 135);
    ctx.fillText("NOUVEAU SOLDE:", textX, y + 168);

    ctx.textAlign = "right";
    ctx.font = `bold 14px ${FONT_FAMILY}`;
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText(formatAmount(balanceBefore), x + cardW - 40, y + 135);

    ctx.font = `bold 16px ${FONT_FAMILY}`;
    ctx.fillStyle = isReceiver ? "#00d4ff" : "#ffd700";
    ctx.fillText(formatAmount(balanceAfter), x + cardW - 40, y + 168);

    ctx.restore();
  };

  await drawPlayerCard(95, "EXPÉDITEUR", senderName, senderTag, senderRank, senderBalanceBefore, senderBalanceAfter, senderAvatar, false);
  await drawPlayerCard(685, "DESTINATAIRE", receiverName, receiverTag, receiverRank, receiverBalanceBefore, receiverBalanceAfter, receiverAvatar, true);

  // =========================================================================
  // 6. CERCLE CENTRAL (NOYAU QUANTIQUE ET VRAI MONTANT)
  // =========================================================================

  ctx.save();
  const coreRadius = 120;

  const coreBgGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, coreRadius + 60);
  coreBgGlow.addColorStop(0, "rgba(0, 212, 255, 0.35)");
  coreBgGlow.addColorStop(0.6, "rgba(0, 150, 255, 0.1)");
  coreBgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = coreBgGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius + 60, 0, Math.PI * 2);
  ctx.fill();

  const coreInnerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
  coreInnerGrad.addColorStop(0, "#092542");
  coreInnerGrad.addColorStop(0.7, "#031021");
  coreInnerGrad.addColorStop(1, "#01060e");
  ctx.fillStyle = coreInnerGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // Contour lumineux
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Header du noyau
  ctx.fillStyle = "#8a99ad";
  ctx.font = `bold 11px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText("MONTANT TRANSFÉRÉ", centerX, centerY - 45);

  // Vrai Montant Réel (Ajustement dynamique de la taille si très grand)
  const formattedRealAmount = formatAmount(amount);
  let fontSize = 32;
  if (formattedRealAmount.length > 12) fontSize = 24;
  if (formattedRealAmount.length > 16) fontSize = 18;

  ctx.fillStyle = "#ffd700"; // Doré pour l'élément clé
  ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
  ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
  ctx.shadowBlur = 12;
  ctx.fillText(formattedRealAmount, centerX, centerY + 8);
  ctx.shadowBlur = 0;

  // Ligne sous le montant
  ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - 60, centerY + 24);
  ctx.lineTo(centerX + 60, centerY + 24);
  ctx.stroke();

  // Badge d'état
  ctx.fillStyle = "#00d4ff";
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 8;
  ctx.font = `bold 11px ${FONT_FAMILY}`;
  ctx.fillText("● SUCCESS / VERIFIED ●", centerX, centerY + 48);
  ctx.shadowBlur = 0;

  ctx.restore();

  // =========================================================================
  // 7. PIED DE PAGE & VIGNETTE
  // =========================================================================

  ctx.save();
  ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, H - 60);
  ctx.lineTo(W - 60, H - 60);
  ctx.stroke();

  ctx.fillStyle = "rgba(131, 217, 255, 0.6)";
  ctx.font = `11px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText(`SYSTEM: ${systemName}  //  DATE: ${date}  //  POWERED BY SHADE QUANTUM`, W / 2, H - 38);

  const vignette = ctx.createRadialGradient(centerX, centerY, W * 0.4, centerX, centerY, W * 0.7);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0, 4, 10, 0.65)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();

  return canvas.toBuffer("image/png");
}

module.exports = { createTransferCard };
