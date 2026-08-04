const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// --- OPTIONNEL : Enregistrement de la police futuriste si le fichier TTF est présent ---
try {
  const fontPath = path.join(__dirname, "fonts", "Orbitron-Bold.ttf");
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: "Orbitron" });
  }
} catch (e) {
  console.log("Police Orbitron non trouvée, utilisation du fallback sans-serif.");
}

const FONT_FAMILY = '"Orbitron", "Oxanium", "Arial", sans-serif';

/**
 * Génère une carte de transfert ultra-premium en 1920x1080
 * @returns {Promise<Buffer>} Buffer PNG exploitable directement pour Messenger / Discord
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
  // 1. ARRIÈRE-PLAN & EFFETS DE LUMIÈRE (BACKGROUND & NEON GLOW)
  // =========================================================================
  // Fond sombre Sci-Fi
  const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W / 1.2);
  bgGrad.addColorStop(0, "#081226");
  bgGrad.addColorStop(0.6, "#030814");
  bgGrad.addColorStop(1, "#010308");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Halo Cyan sous l'émetteur
  const glowSender = ctx.createRadialGradient(400, H / 2, 50, 400, H / 2, 500);
  glowSender.addColorStop(0, "rgba(0, 240, 255, 0.15)");
  glowSender.addColorStop(1, "transparent");
  ctx.fillStyle = glowSender;
  ctx.fillRect(0, 0, W, H);

  // Halo Bleu sous le récepteur
  const glowReceiver = ctx.createRadialGradient(1520, H / 2, 50, 1520, H / 2, 500);
  glowReceiver.addColorStop(0, "rgba(0, 150, 255, 0.15)");
  glowReceiver.addColorStop(1, "transparent");
  ctx.fillStyle = glowReceiver;
  ctx.fillRect(0, 0, W, H);

  // Halo Néon sous le noyau central
  const glowCenter = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 350);
  glowCenter.addColorStop(0, "rgba(0, 240, 255, 0.25)");
  glowCenter.addColorStop(1, "transparent");
  ctx.fillStyle = glowCenter;
  ctx.fillRect(0, 0, W, H);

  // Grille Cybernétique en fond
  ctx.strokeStyle = "rgba(0, 240, 255, 0.03)";
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < W; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // =========================================================================
  // 2. CADRE DE BORDURE HUD PRINCIPAL
  // =========================================================================
  const pad = 50;
  ctx.save();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Coins biseautés style Sci-Fi
  ctx.moveTo(pad + 40, pad);
  ctx.lineTo(W - pad - 40, pad);
  ctx.lineTo(W - pad, pad + 40);
  ctx.lineTo(W - pad, H - pad - 40);
  ctx.lineTo(W - pad - 40, H - pad);
  ctx.lineTo(pad + 40, H - pad);
  ctx.lineTo(pad, H - pad - 40);
  ctx.lineTo(pad, pad + 40);
  ctx.closePath();
  ctx.stroke();

  // Éléments décoratifs aux coins du cadre
  const drawHUDCorner = (x, y, rotation) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(0, 0);
    ctx.lineTo(30, 0);
    ctx.stroke();
    ctx.restore();
  };
  drawHUDCorner(pad, pad, 0);
  drawHUDCorner(W - pad, pad, 90);
  drawHUDCorner(W - pad, H - pad, 180);
  drawHUDCorner(pad, H - pad, 270);
  ctx.restore();

  // =========================================================================
  // 3. LIGNES DE CONNEXION TECHNIQUE DU SYSTEME DE TRANSFERT
  // =========================================================================
  ctx.save();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 8;
  
  // Ligne de flux gauche (Émetteur vers Centre)
  ctx.beginPath();
  ctx.moveTo(560, H / 2);
  ctx.lineTo(W / 2 - 200, H / 2);
  ctx.stroke();

  // Ligne de flux droite (Centre vers Récepteur)
  ctx.beginPath();
  ctx.moveTo(W / 2 + 200, H / 2);
  ctx.lineTo(1360, H / 2);
  ctx.stroke();

  // Petits nœuds lumineux sur les lignes
  [650, 750, 1170, 1270].forEach((nx) => {
    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(nx, H / 2, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // =========================================================================
  // 4. PANNEAUX DU JOUEUR EMMETEUR & RÉCEPTEUR
  // =========================================================================
  const drawPlayerCard = async (x, y, name, avatarUrl, rank, balance, isSender) => {
    const cardW = 420;
    const cardH = 680;
    const themeColor = isSender ? "#00f0ff" : "#0096ff";

    // Fond du panneau semi-transparent
    ctx.save();
    ctx.fillStyle = "rgba(6, 18, 38, 0.75)";
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 1.5;
    
    // Forme du panneau avec coins biseautés
    ctx.beginPath();
    ctx.moveTo(x + 20, y);
    ctx.lineTo(x + cardW - 20, y);
    ctx.lineTo(x + cardW, y + 20);
    ctx.lineTo(x + cardW, y + cardH - 20);
    ctx.lineTo(x + cardW - 20, y + cardH);
    ctx.lineTo(x + 20, y + cardH);
    ctx.lineTo(x, y + cardH - 20);
    ctx.lineTo(x, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // En-tête du panneau (SENDER / RECEIVER)
    ctx.fillStyle = themeColor;
    ctx.font = `bold 16px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.fillText(isSender ? "/// SENDER ENTITY" : "/// RECEIVER ENTITY", x + cardW / 2, y + 45);

    // Dynamic Avatar Circle Rendering
    const avX = x + cardW / 2;
    const avY = y + 170;
    const avRadius = 80;

    // Halo autour du cercle avatar
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avX, avY, avRadius + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Affichage de l'image de l'avatar
    try {
      let img;
      if (avatarUrl) {
        img = await loadImage(avatarUrl);
      } else {
        // Image de secours si pas d'avatar
        const defaultCanvas = createCanvas(200, 200);
        const dctx = defaultCanvas.getContext("2d");
        dctx.fillStyle = "#0c2540";
        dctx.fillRect(0, 0, 200, 200);
        dctx.fillStyle = themeColor;
        dctx.font = "80px sans-serif";
        dctx.textAlign = "center";
        dctx.fillText("?", 100, 130);
        img = await loadImage(defaultCanvas.toBuffer());
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(avX, avY, avRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, avX - avRadius, avY - avRadius, avRadius * 2, avRadius * 2);
      ctx.restore();
    } catch (e) {
      console.error("Erreur de chargement avatar:", e);
    }

    // Nom du joueur
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold 28px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.fillText(name.toUpperCase(), x + cardW / 2, y + 300);

    // Badge de Rang HUD
    ctx.fillStyle = "rgba(0, 240, 255, 0.1)";
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.fillRect(x + cardW / 2 - 70, y + 325, 140, 30);
    ctx.strokeRect(x + cardW / 2 - 70, y + 325, 140, 30);

    ctx.fillStyle = themeColor;
    ctx.font = `bold 14px ${FONT_FAMILY}`;
    ctx.fillText(`RANK ${rank}`, x + cardW / 2, y + 345);

    // Ligne de séparation
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(x + 40, y + 380);
    ctx.lineTo(x + cardW - 40, y + 380);
    ctx.stroke();

    // Section Statistiques de Solde
    const drawStatBlock = (label, val, statY, valColor = "#ffffff") => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = `12px ${FONT_FAMILY}`;
      ctx.textAlign = "left";
      ctx.fillText(label, x + 40, statY);

      ctx.fillStyle = valColor;
      ctx.font = `bold 22px ${FONT_FAMILY}`;
      ctx.textAlign = "right";
      ctx.fillText(val.toLocaleString() + " $", x + cardW - 40, statY + 5);
    };

    drawStatBlock("PREVIOUS BAL.", balance.before, y + 430, "#a0aab8");
    drawStatBlock("UPDATED BAL.", balance.after, y + 510, themeColor);

    // Barre d'état technologique en bas du panneau
    ctx.fillStyle = themeColor;
    ctx.fillRect(x + 40, y + 600, cardW - 80, 4);
    
    ctx.restore();
  };

  // Dessiner l'émetteur (Gauche)
  await drawPlayerCard(140, 200, senderName, senderAvatar, senderRank, senderBalance, true);

  // Dessiner le récepteur (Droite)
  await drawPlayerCard(1360, 200, receiverName, receiverAvatar, receiverRank, receiverBalance, false);

  // =========================================================================
  // 5. CERCLE ET STRUCTURE DU MOYEN CENTRAL (TRANSFER AMOUNT CORE)
  // =========================================================================
  const centerX = W / 2;
  const centerY = H / 2;

  ctx.save();

  // Cercles concentriques HUD animés visuellement
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 20;

  // Anneau Externe
  ctx.strokeStyle = "rgba(0, 240, 255, 0.8)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 170, 0, Math.PI * 2);
  ctx.stroke();

  // Anneau Interne pointillés Tech
  ctx.setLineDash([12, 12]);
  ctx.strokeStyle = "#0096ff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Fond du noyau central
  const coreGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 140);
  coreGrad.addColorStop(0, "rgba(8, 30, 60, 0.95)");
  coreGrad.addColorStop(1, "rgba(2, 10, 25, 0.95)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 140, 0, Math.PI * 2);
  ctx.fill();

  // Affichage du Montant du Transfert
  ctx.shadowBlur = 10;
  ctx.fillStyle = "rgba(0, 240, 255, 0.7)";
  ctx.font = `bold 16px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.fillText("TRANSFER AMOUNT", centerX, centerY - 45);

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 42px ${FONT_FAMILY}`;
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 15;
  ctx.fillText(`+${amount.toLocaleString()}`, centerX, centerY + 10);

  ctx.fillStyle = "#00f0ff";
  ctx.font = `bold 18px ${FONT_FAMILY}`;
  ctx.fillText("CREDITS", centerX, centerY + 45);

  ctx.restore();

  // =========================================================================
  // 6. EN-TÊTE SUPÉRIEUR & INFOS DU STATUT (VERIFIED & TIMESTAMP)
  // =========================================================================
  // Titre Général du HUD
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 36px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.shadowColor = "#00f0ff";
  ctx.shadowBlur = 15;
  ctx.fillText("TRANSACTION SYSTEM", W / 2, 105);

  ctx.fillStyle = "#00f0ff";
  ctx.font = `14px ${FONT_FAMILY}`;
  ctx.shadowBlur = 0;
  ctx.fillText("SECURE QUANTUM PROTOCOL // SYSTEM_ID: #8894-A", W / 2, 135);

  // Badge de Statut VERIFIED en bas du noyau central
  const badgeY = centerY + 240;
  ctx.fillStyle = "rgba(0, 255, 170, 0.1)";
  ctx.strokeStyle = "#00ffaa";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "#00ffaa";
  ctx.shadowBlur = 12;

  // Fond du badge
  ctx.beginPath();
  ctx.roundRect(W / 2 - 110, badgeY - 20, 220, 40, 8);
  ctx.fill();
  ctx.stroke();

  // Texte Verified
  ctx.fillStyle = "#00ffaa";
  ctx.font = `bold 16px ${FONT_FAMILY}`;
  ctx.fillText("✓ STATUS: VERIFIED", W / 2, badgeY + 5);

  // Horodatage / Date sous le Badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.font = `13px ${FONT_FAMILY}`;
  ctx.shadowBlur = 0;
  ctx.fillText(`TIMESTAMP: ${date}`, W / 2, H - 90);

  ctx.restore();

  // Retourne le Buffer PNG directement exploitable
  return canvas.toBuffer("image/png");
}

// =========================================================================
// 7. EXEMPLE D'UTILISATION / TEST LOCAL
// =========================================================================
(async () => {
  const buffer = await createTransferCard({
    senderName: "Shadow_Admin",
    senderAvatar: "https://i.imgur.com/I3VsBEt.png", // Lien image direct ou null
    receiverName: "Cyber_Player",
    receiverAvatar: "https://i.imgur.com/I3VsBEt.png",
    amount: 1250000,
    senderBalance: { before: 5000000, after: 3750000 },
    receiverBalance: { before: 120000, after: 1370000 },
    senderRank: "#001",
    receiverRank: "#014",
    date: "04/08/2026 - 14:32:10 UTC"
  });

  // Sauvegarde locale pour tester le rendu visuel
  fs.writeFileSync("./preview_transfer_card.png", buffer);
  console.log(" Carte générée avec succès : ./preview_transfer_card.png");
})();

module.exports = { createTransferCard };
