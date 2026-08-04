const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Tente de charger la police Orbitron si elle existe
try {
  const fontPath = path.join(__dirname, "fonts", "Orbitron-Bold.ttf");
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: "Orbitron" });
  }
} catch (e) {}

const FONT_FAMILY = '"Orbitron", "Oxanium", "Arial", sans-serif';

/**
 * Génère une carte de transfert HORIZONTALE ultra-premium HUD Sci-Fi (1920x1080)
 * Layout : Émetteur en HAUT / Récepteur en BAS / Noyau Central Flottant
 */
async function createTransferCard({
  senderName = "SENDER",
  senderAvatar,
  receiverName = "RECEIVER",
  receiverAvatar,
  amount = 0,
  senderBalance = { before: 0, after: 0 },
  receiverBalance = { before: 0, after: 0 },
  senderRank = "#001",
  receiverRank = "#002",
  date = new Date().toLocaleString("fr-FR")
}) {
  const W = 1920;
  const H = 1080;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // =========================================================================
  // 1. FOND DEEP SCI-FI & EFFETS NÉON HAUTE DENSITÉ
  // =========================================================================
  // Fond sombre galactique
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W / 1.1);
  bgGrad.addColorStop(0, "#081328");
  bgGrad.addColorStop(0.5, "#030a18");
  bgGrad.addColorStop(1, "#01040a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Halo Cyan Haut (Émetteur)
  const glowTop = ctx.createRadialGradient(W / 2, 220, 50, W / 2, 220, 600);
  glowTop.addColorStop(0, "rgba(0, 240, 255, 0.18)");
  glowTop.addColorStop(1, "transparent");
  ctx.fillStyle = glowTop;
  ctx.fillRect(0, 0, W, H);

  // Halo Bleu Bas (Récepteur)
  const glowBottom = ctx.createRadialGradient(W / 2, 860, 50, W / 2, 860, 600);
  glowBottom.addColorStop(0, "rgba(0, 140, 255, 0.18)");
  glowBottom.addColorStop(1, "transparent");
  ctx.fillStyle = glowBottom;
  ctx.fillRect(0, 0, W, H);

  // Halo Ambiance Noyau Central
  const glowCore = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 400);
  glowCore.addColorStop(0, "rgba(0, 240, 255, 0.35)");
  glowCore.addColorStop(0.5, "rgba(0, 150, 255, 0.1)");
  glowCore.addColorStop(1, "transparent");
  ctx.fillStyle = glowCore;
  ctx.fillRect(0, 0, W, H);

  // Grille cybernétique fine
  ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
  ctx.lineWidth = 1;
  const gridSize = 50;
  for (let x = 0; x < W; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // =========================================================================
  // 2. CADRES HUD EXTERNES & COINS FUTURISTES TRIPLE-BORDURES
  // =========================================================================
  const margin = 45;
  ctx.save();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
  ctx.lineWidth = 2;
  
  // Cadre biseauté principal
  ctx.beginPath();
  ctx.moveTo(margin + 50, margin);
  ctx.lineTo(W - margin - 50, margin);
  ctx.lineTo(W - margin, margin + 50);
  ctx.lineTo(W - margin, H - margin - 50);
  ctx.lineTo(W - margin - 50, H - margin);
  ctx.lineTo(margin + 50, H - margin);
  ctx.lineTo(margin, H - margin - 50);
  ctx.lineTo(margin, margin + 50);
  ctx.closePath();
  ctx.stroke();

  // Fonction pour dessiner les coins complexes du HUD AAA
  const drawAdvancedCorner = (x, y, angle) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.strokeStyle = "#00f0ff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 12;

    // Lignes angulaires néon
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(0, 0);
    ctx.lineTo(40, 0);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 50);
    ctx.lineTo(10, 10);
    ctx.lineTo(50, 10);
    ctx.stroke();

    // Petit point lumineux de coin
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-2, -2, 5, 5);
    ctx.restore();
  };

  drawAdvancedCorner(margin, margin, 0);
  drawAdvancedCorner(W - margin, margin, 90);
  drawAdvancedCorner(W - margin, H - margin, 180);
  drawAdvancedCorner(margin, H - margin, 270);
  ctx.restore();

  // =========================================================================
  // 3. FLÈCHES ET CIRCUIT DE FLUX VERTICAL (DU HAUT VERS LE BAS)
  // =========================================================================
  ctx.save();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 10;

  // Ligne de connexion verticale principale passant derrière le centre
  ctx.beginPath();
  ctx.moveTo(W / 2, 290);
  ctx.lineTo(W / 2, H - 290);
  ctx.stroke();

  // Flèches néon indicatrices de flux vers le bas
  const drawArrow = (ay) => {
    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.moveTo(W / 2 - 12, ay);
    ctx.lineTo(W / 2 + 12, ay);
    ctx.lineTo(W / 2, ay + 15);
    ctx.closePath();
    ctx.fill();
  };

  drawArrow(310);
  drawArrow(340);
  drawArrow(725);
  drawArrow(755);

  ctx.restore();

  // =========================================================================
  // 4. PANNEAUX HORIZONTAUX (ÉMETTEUR EN HAUT / RÉCEPTEUR EN BAS)
  // =========================================================================
  const drawHorizontalPanel = async (y, name, avatarUrl, rank, balance, isSender) => {
    const panelW = 1420;
    const panelH = 180;
    const x = (W - panelW) / 2;
    const themeColor = isSender ? "#00f0ff" : "#0096ff";

    ctx.save();

    // Fond du panneau semi-translucide Cyber
    const panelGrad = ctx.createLinearGradient(x, y, x + panelW, y);
    panelGrad.addColorStop(0, "rgba(5, 18, 38, 0.85)");
    panelGrad.addColorStop(0.5, "rgba(10, 30, 60, 0.65)");
    panelGrad.addColorStop(1, "rgba(5, 18, 38, 0.85)");
    ctx.fillStyle = panelGrad;

    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 12;

    // Découpe biseautée du panneau horizontal
    const b = 25;
    ctx.beginPath();
    ctx.moveTo(x + b, y);
    ctx.lineTo(x + panelW - b, y);
    ctx.lineTo(x + panelW, y + b);
    ctx.lineTo(x + panelW, y + panelH - b);
    ctx.lineTo(x + panelW - b, y + panelH);
    ctx.lineTo(x + b, y + panelH);
    ctx.lineTo(x, y + panelH - b);
    ctx.lineTo(x, y + b);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Reset ombre pour l'intérieur
    ctx.shadowBlur = 0;

    // --- AVATAR DANS CERCLAGE HAUTE LUMINOSITÉ ---
    const avX = x + 110;
    const avY = y + panelH / 2;
    const avRadius = 65;

    // Anneaux externes de l'avatar
    ctx.save();
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Chargement de l'avatar
    try {
      let img;
      if (avatarUrl) {
        img = await loadImage(avatarUrl);
      } else {
        const defaultCanvas = createCanvas(150, 150);
        const dctx = defaultCanvas.getContext("2d");
        dctx.fillStyle = "#0b2038";
        dctx.fillRect(0, 0, 150, 150);
        dctx.fillStyle = themeColor;
        dctx.font = "bold 60px sans-serif";
        dctx.textAlign = "center";
        dctx.fillText("?", 75, 100);
        img = await loadImage(defaultCanvas.toBuffer());
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(avX, avY, avRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
      ctx.restore();
    } catch (e) {
      console.error("Erreur avatar:", e);
    }

    // --- INFORMATIONS DU JOUEUR (Nom, Tag, Rank) ---
    const textX = x + 210;

    // Badge d'entité (SENDER / RECEIVER)
    ctx.fillStyle = themeColor;
    ctx.font = `bold 14px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.fillText(isSender ? "/// SOURCE ENTITY [SENDER]" : "/// DESTINATION ENTITY [RECEIVER]", textX, y + 45);

    // Nom du Joueur
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 32px ${FONT_FAMILY}`;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 8;
    ctx.fillText(name.toUpperCase().slice(0, 18), textX, y + 88);
    ctx.shadowBlur = 0;

    // Badge de Rank
    ctx.fillStyle = "rgba(0, 240, 255, 0.12)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.fillRect(textX, y + 105, 120, 28);
    ctx.strokeRect(textX, y + 105, 120, 28);

    ctx.fillStyle = themeColor;
    ctx.font = `bold 13px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.fillText(`RANK ${rank}`, textX + 60, y + 124);

    // --- BLOCS DE SOLDE HORIZONTAUX (À DROITE DU PANNEAU) ---
    const balX = x + panelW - 380;

    // Solde Avant (Previous)
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = `13px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.fillText("PREVIOUS BAL.", balX, y + 60);

    ctx.fillStyle = "#8a9bb0";
    ctx.font = `bold 22px ${FONT_FAMILY}`;
    ctx.textAlign = "right";
    ctx.fillText(`${balance.before.toLocaleString()} $`, balX + 320, y + 60);

    // Ligne fine séparatrice de solde
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(balX, y + 80);
    ctx.lineTo(balX + 320, y + 80);
    ctx.stroke();

    // Solde Après (Updated)
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = `13px ${FONT_FAMILY}`;
    ctx.textAlign = "left";
    ctx.fillText("UPDATED BAL.", balX, y + 120);

    ctx.fillStyle = themeColor;
    ctx.font = `bold 26px ${FONT_FAMILY}`;
    ctx.textAlign = "right";
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 10;
    ctx.fillText(`${balance.after.toLocaleString()} $`, balX + 320, y + 122);

    ctx.restore();
  };

  // Dessiner l'émetteur (Haut)
  await drawHorizontalPanel(120, senderName, senderAvatar, senderRank, senderBalance, true);

  // Dessiner le récepteur (Bas)
  await drawHorizontalPanel(780, receiverName, receiverAvatar, receiverRank, receiverBalance, false);

  // =========================================================================
  // 5. CERCLE NOYAU CENTRAL (STRUCTURE ULTRA-DÉTAILLÉE AAA)
  // =========================================================================
  const centerX = W / 2;
  const centerY = H / 2;

  ctx.save();

  // 1. Halo Néon Extérieur du Noyau
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 30;

  // 2. Anneau Extérieur Biseauté
  ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 180, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Anneau Interne Pointillé Tech
  ctx.setLineDash([14, 10]);
  ctx.strokeStyle = "#0096ff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]); // Reset

  // 4. Fond du Noyau Central en Dégradé Profond
  const coreBg = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 150);
  coreBg.addColorStop(0, "rgba(6, 25, 55, 0.98)");
  coreBg.addColorStop(0.7, "rgba(2, 12, 30, 0.98)");
  coreBg.addColorStop(1, "rgba(0, 5, 15, 0.98)");
  ctx.fillStyle = coreBg;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
  ctx.fill();

  // 5. Points / Nœuds Lumineux sur la circonférence
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const px = centerX + 160 * Math.cos(angle);
    const py = centerY + 160 * Math.sin(angle);

    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Textes du Montant Transféré au Centre
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 10;

  ctx.fillStyle = "rgba(0, 240, 255, 0.75)";
  ctx.font = `bold 15px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText("TRANSACTION CORE", centerX, centerY - 45);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 44px ${FONT_FAMILY}`;
  ctx.shadowBlur = 20;
  ctx.fillText(`+${amount.toLocaleString()}`, centerX, centerY + 10);

  ctx.fillStyle = "#00f0ff";
  ctx.font = `bold 18px ${FONT_FAMILY}`;
  ctx.shadowBlur = 10;
  ctx.fillText("CREDITS", centerX, centerY + 48);

  ctx.restore();

  // =========================================================================
  // 6. PIED DE PAGE, VERIFIED & TIMESTAMP HUD
  // =========================================================================
  ctx.save();

  // Titre / Badge de Statut "VERIFIED" en bas à gauche
  ctx.fillStyle = "rgba(0, 255, 170, 0.1)";
  ctx.strokeStyle = "#00ffaa";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "#00ffaa";
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.roundRect(margin + 30, H - margin - 35, 230, 36, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#00ffaa";
  ctx.font = `bold 14px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText("✓ STATUS: VERIFIED", margin + 145, H - margin - 12);

  // Date et Horodatage en bas à droite
  ctx.fillStyle = "rgba(0, 240, 255, 0.5)";
  ctx.font = `13px ${FONT_FAMILY}`;
  ctx.textAlign = "right";
  ctx.shadowBlur = 0;
  ctx.fillText(`TIMESTAMP: ${date} // QUANTUM_GATEWAY_V2`, W - margin - 30, H - margin - 15);

  ctx.restore();

  return canvas.toBuffer("image/png");
}

module.exports = { createTransferCard };
