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
 * Formate les montants sous forme propre ($13.11K, $5.00)
 */
function formatAmount(val) {
  if (val >= 1000000) {
    return `$${(val / 1000000).toFixed(2)}M`;
  }
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(2)}K`;
  }
  return `$${val.toFixed(2)}`;
}

/**
 * Alternative 100% compatible à ctx.roundRect (Évite les bugs node-canvas anciens)
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
 * Trace un panneau HUD avec coins biseautés futuristes
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
 * Générateur pseudo-aléatoire déterministe pour conserver les mêmes particules et bruits à chaque rendu
 */
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// -------------------------------------------------------------------------
// MOTEUR DE GÉNÉRATION DU VISUEL AAA
// -------------------------------------------------------------------------

/**
 * Génère la carte de transfert au style AAA HUD & Banking Cyberpunk
 */
async function createTransferCard({
  senderName = "YUKI",
  senderTag = "30 48",
  senderRank = "[I] Starter",
  senderBalanceAfter = 5.0,
  senderAvatar,
  receiverName = "Kai",
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

  const centerX = W / 2;
  const centerY = H / 2;

  // =========================================================================
  // 1. ARRIÈRE-PLAN MULTI-COUCHE COMPLEXE
  // =========================================================================

  // Gradient spatial profond
  const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, W * 0.85);
  bgGrad.addColorStop(0.0, "#081d33");
  bgGrad.addColorStop(0.4, "#030e1a");
  bgGrad.addColorStop(0.75, "#01060d");
  bgGrad.addColorStop(1.0, "#000205");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Halos lumineux d'ambiance néon
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

  // Particules quantiques dérivantes
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
  // 2. CADRE EXTÉRIEUR DE L'INTERFACE HUD AAA
  // =========================================================================

  // Bordure principale extérieure
  ctx.strokeStyle = "rgba(0, 212, 255, 0.25)";
  ctx.lineWidth = 2;
  drawBeveledPath(ctx, 15, 15, W - 30, H - 30, 25);
  ctx.stroke();

  // Bordure fine interne avec lueur
  ctx.strokeStyle = "rgba(0, 212, 255, 0.5)";
  ctx.lineWidth = 1;
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 10;
  drawBeveledPath(ctx, 22, 22, W - 44, H - 44, 20);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Éléments d'angles HUD complexes
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
  // 3. EN-TÊTE ULTRA-DÉTAILLÉ
  // =========================================================================

  ctx.save();
  // Halo lumineux du titre
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 15;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 22px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText(":: CANAL DE TRANSFERT QUANTIQUE ::", centerX, 58);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(0, 212, 255, 0.5)";
  ctx.font = `10px ${FONT_FAMILY}`;
  ctx.fillText("SYS.LOC: NETWORK // SECURED PROTOCOL V8.42", centerX, 74);

  // Lignes de séparation de l'en-tête
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
  // 4. LIGNES TECHNIQUE DE CONNEXION CENTRALES
  // =========================================================================

  ctx.save();
  // Ligne de flux principale lumineuse
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

  // Lignes pointillées secondaires parallèles
  ctx.strokeStyle = "rgba(0, 212, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(centerX - 12, 280); ctx.lineTo(centerX - 12, H - 280);
  ctx.moveTo(centerX + 12, 280); ctx.lineTo(centerX + 12, H - 280);
  ctx.stroke();
  ctx.setLineDash([]);

  // Nœuds d'énergie animés sur les flux
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
  // 5. FONCTION D'AFFICHAGE DU PANNEAU JOUEUR (GLASSMORPHISM AAA)
  // =========================================================================

  const drawPlayerCard = async (y, title, name, tag, rank, balanceAfter, avatarUrl, isReceiver) => {
    const cardW = 830;
    const cardH = 200;
    const x = (W - cardW) / 2;

    ctx.save();

    // Ombre portée sous le panneau
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = "#020914";
    drawBeveledPath(ctx, x, y, cardW, cardH, 15);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Fond du panneau semi-transparent avec gradient subtil
    const panelGrad = ctx.createLinearGradient(x, y, x + cardW, y + cardH);
    panelGrad.addColorStop(0, "rgba(8, 28, 50, 0.85)");
    panelGrad.addColorStop(0.5, "rgba(4, 18, 34, 0.75)");
    panelGrad.addColorStop(1, "rgba(2, 11, 22, 0.9)");
    ctx.fillStyle = panelGrad;
    drawBeveledPath(ctx, x, y, cardW, cardH, 15);
    ctx.fill();

    // Reflet de verre supérieur ("Glassmorphism")
    const glassGrad = ctx.createLinearGradient(x, y, x, y + 60);
    glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
    glassGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glassGrad;
    drawBeveledPath(ctx, x, y, cardW, cardH, 15);
    ctx.fill();

    // Bordure néon avec glow du panneau
    ctx.strokeStyle = isReceiver ? "rgba(0, 212, 255, 0.6)" : "rgba(0, 180, 255, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 10;
    drawBeveledPath(ctx, x, y, cardW, cardH, 15);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Détails de cadre intérieur HUD
    ctx.strokeStyle = "rgba(0, 212, 255, 0.15)";
    ctx.lineWidth = 1;
    drawBeveledPath(ctx, x + 6, y + 6, cardW - 12, cardH - 12, 12);
    ctx.stroke();

    // Coins décoratifs internes
    const drawInnerCorner = (cx, cy, rx, ry) => {
      ctx.strokeStyle = "#83d9ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + rx * 12, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + ry * 12);
      ctx.stroke();
    };
    drawInnerCorner(x + 14, y + 14, 1, 1);
    drawInnerCorner(x + cardW - 14, y + 14, -1, 1);
    drawInnerCorner(x + 14, y + cardH - 14, 1, -1);
    drawInnerCorner(x + cardW - 14, y + cardH - 14, -1, -1);

    // Titre d'entité avec badge HUD
    ctx.fillStyle = isReceiver ? "rgba(0, 212, 255, 0.2)" : "rgba(0, 150, 255, 0.2)";
    ctx.fillRect(x + 20, y + 18, 140, 22);
    ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
    ctx.strokeRect(x + 20, y + 18, 140, 22);

    ctx.fillStyle = "#83d9ff";
    ctx.font = `bold 11px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.fillText(`// ${title}`, x + 90, y + 33);

    // =========================================================================
    // RENDEDU AVATAR AVANCE (CYBER DOCK)
    // =========================================================================
    const avX = x + 110;
    const avY = y + cardH / 2 + 10;
    const avRadius = 55;

    // Halos de l'avatar
    const avGlow = ctx.createRadialGradient(avX, avY, avRadius - 10, avX, avY, avRadius + 20);
    avGlow.addColorStop(0, "rgba(0, 212, 255, 0)");
    avGlow.addColorStop(0.8, "rgba(0, 212, 255, 0.3)");
    avGlow.addColorStop(1, "rgba(0, 212, 255, 0)");
    ctx.fillStyle = avGlow;
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 20, 0, Math.PI * 2);
    ctx.fill();

    // Anneau extérieur avec graduations
    ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Anneau plein néon
    ctx.strokeStyle = "#00d4ff";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Image Avatar avec masque circulaire et reflet
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

    // Reflet de verre sur l'avatar
    const avGlass = ctx.createLinearGradient(avX - avRadius, avY - avRadius, avX + avRadius, avY + avRadius);
    avGlass.addColorStop(0, "rgba(255, 255, 255, 0.35)");
    avGlass.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = avGlass;
    ctx.fillRect(avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
    ctx.restore();

    // =========================================================================
    // INFORMATIONS TEXTUELLES DU JOUEUR
    // =========================================================================
    const textX = avX + avRadius + 35;

    // Nom du joueur
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 28px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.shadowColor = "rgba(0, 212, 255, 0.5)";
    ctx.shadowBlur = 8;
    ctx.fillText(name, textX, y + 75);
    ctx.shadowBlur = 0;

    // Tag à côté du nom
    if (tag) {
      const nameWidth = ctx.measureText(name).width;
      ctx.fillStyle = "#4a9cb5";
      ctx.font = `13px ${FONT_FAMILY}`;
      ctx.fillText(`ID: ${tag}`, textX + nameWidth + 15, y + 73);
    }

    // Badge Rang / Grade
    const rankY = y + 106;
    ctx.fillStyle = isReceiver ? "#00d4ff" : "#ffb700";
    ctx.shadowColor = isReceiver ? "#00d4ff" : "#ffb700";
    ctx.shadowBlur = 6;
    ctx.font = `bold 14px ${FONT_FAMILY}`;
    ctx.fillText(`RANK: ${rank}`, textX, rankY);
    ctx.shadowBlur = 0;

    // Séparateur horizontal stylisé
    const lineGrad = ctx.createLinearGradient(textX, 0, x + cardW - 30, 0);
    lineGrad.addColorStop(0, "rgba(0, 212, 255, 0.5)");
    lineGrad.addColorStop(1, "rgba(0, 212, 255, 0)");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(textX, y + 120);
    ctx.lineTo(x + cardW - 30, y + 120);
    ctx.stroke();

    // Bloc Solde après transfert
    ctx.fillStyle = "#5c9bb5";
    ctx.font = `11px ${FONT_FAMILY}`;
    ctx.fillText("SOLDE NOUVEAU APRES TRANSFERT :", textX, y + 148);

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 22px ${FONT_FAMILY}`;
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 10;
    ctx.fillText(formatAmount(balanceAfter), textX + 240, y + 149);
    ctx.shadowBlur = 0;

    ctx.restore();
  };

  // Dessin des deux panneaux principaux
  await drawPlayerCard(95, "ENTITÉ ÉMETTRICE", senderName, senderTag, senderRank, senderBalanceAfter, senderAvatar, false);
  await drawPlayerCard(685, "ENTITÉ RÉCEPTRICE", receiverName, receiverTag, receiverRank, receiverBalanceAfter, receiverAvatar, true);

  // =========================================================================
  // 6. CERCLE CENTRAL AAA (LE NOYAU DE TRANSACTION)
  // =========================================================================

  ctx.save();
  const coreRadius = 120;

  // Enorme halo de fond derrière le cercle
  const coreBgGlow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, coreRadius + 60);
  coreBgGlow.addColorStop(0, "rgba(0, 212, 255, 0.35)");
  coreBgGlow.addColorStop(0.6, "rgba(0, 150, 255, 0.1)");
  coreBgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = coreBgGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius + 60, 0, Math.PI * 2);
  ctx.fill();

  // Fond sombre du noyau
  const coreInnerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
  coreInnerGrad.addColorStop(0, "#092542");
  coreInnerGrad.addColorStop(0.7, "#031021");
  coreInnerGrad.addColorStop(1, "#01060e");
  ctx.fillStyle = coreInnerGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // Anneau externe 1: Graduations HUD
  ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
  ctx.lineWidth = 1.5;
  const numTicks = 36;
  for (let i = 0; i < numTicks; i++) {
    const angle = (i * Math.PI * 2) / numTicks;
    const innerT = coreRadius + 14;
    const outerT = coreRadius + (i % 3 === 0 ? 22 : 18);

    const x1 = centerX + innerT * Math.cos(angle);
    const y1 = centerY + innerT * Math.sin(angle);
    const x2 = centerX + outerT * Math.cos(angle);
    const y2 = centerY + outerT * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Anneau 2: Pointillés tournants
  ctx.strokeStyle = "rgba(131, 217, 255, 0.6)";
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 7]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Anneau 3: Bordure principale lumineuse
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Anneau 4: Découpes métalliques internes
  ctx.strokeStyle = "rgba(0, 212, 255, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, coreRadius - 12, 0, Math.PI * 2);
  ctx.stroke();

  // Nœuds lumineux cardinales
  [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((angle) => {
    const px = centerX + coreRadius * Math.cos(angle);
    const py = centerY + coreRadius * Math.sin(angle);

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00d4ff";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Textes & Valeurs à l'intérieur du noyau
  ctx.fillStyle = "#4a9cb5";
  ctx.font = `bold 11px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText("VALEUR TRANSMISE", centerX, centerY - 45);

  // Valeur du montant avec lueur intense
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 38px ${FONT_FAMILY}`;
  ctx.shadowColor = "rgba(0, 212, 255, 0.9)";
  ctx.shadowBlur = 15;
  ctx.fillText(formatAmount(amount), centerX, centerY + 8);
  ctx.shadowBlur = 0;

  // Ligne sous le montant
  ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - 60, centerY + 24);
  ctx.lineTo(centerX + 60, centerY + 24);
  ctx.stroke();

  // Badge d'état "TRANSACTION VERIFIED"
  ctx.fillStyle = "#00d4ff";
  ctx.shadowColor = "#00d4ff";
  ctx.shadowBlur = 8;
  ctx.font = `bold 11px ${FONT_FAMILY}`;
  ctx.fillText("● SYSTEM VERIFIED ●", centerX, centerY + 48);
  ctx.shadowBlur = 0;

  ctx.restore();

  // =========================================================================
  // 7. PIED DE PAGE FUTURISTE ET EFFET VIGNETTE
  // =========================================================================

  ctx.save();
  // Ligne supérieure de bas de page
  ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, H - 60);
  ctx.lineTo(W - 60, H - 60);
  ctx.stroke();

  // Texte de bas de page
  ctx.fillStyle = "rgba(131, 217, 255, 0.6)";
  ctx.font = `11px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText(`SYSTEM: ${systemName}  //  TIMESTAMP: ${date}  //  ENCRYPTION: 256-BIT QUANTUM`, W / 2, H - 38);

  // Vignette sombre sur les bords extérieurs pour sceller le look AAA
  const vignette = ctx.createRadialGradient(centerX, centerY, W * 0.4, centerX, centerY, W * 0.7);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0, 4, 10, 0.65)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();

  // Retourne le Buffer PNG final
  return canvas.toBuffer("image/png");
}

module.exports = { createTransferCard };
