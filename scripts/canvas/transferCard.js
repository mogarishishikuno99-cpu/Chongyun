const { createCanvas, loadImage } = require("canvas");

/**
 * Trace un rectangle à coins arrondis (Polyfill pour assurer la compatibilité)
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Dessine un avatar circulaire avec bordure lumineuse
 */
async function drawCircularAvatar(ctx, imgUrl, x, y, radius, borderColor) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  try {
    const avatarImg = await loadImage(imgUrl);
    ctx.drawImage(avatarImg, x - radius, y - radius, radius * 2, radius * 2);
  } catch (err) {
    // Fallback si l'image ne charge pas
    ctx.fillStyle = "#111827";
    ctx.fill();
  }
  ctx.restore();

  // Anneau lumineux autour de l'avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/**
 * Génère la carte de transfert SHADE QUANTUM
 */
async function createTransferCard(data) {
  const {
    senderName = "Expéditeur",
    senderAvatar,
    senderRank = "VIP",
    senderBalanceBefore = 0,
    senderBalanceAfter = 0,
    receiverName = "Destinataire",
    receiverAvatar,
    receiverRank = "USER",
    receiverBalanceBefore = 0,
    receiverBalanceAfter = 0,
    amount = 0,
    systemName = "SHADE TRANSFER",
    date = "2026-08-04",
    transactionId = "TX-000000"
  } = data;

  // Dimensions
  const width = 1000;
  const height = 580;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // ==========================================
  // 1. FOND & EFFETS ATMOSPHÉRIQUES
  // ==========================================
  // Dégradé Noir Profond -> Bleu Nuit
  const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 600);
  bgGradient.addColorStop(0, "#080d1a");
  bgGradient.addColorStop(0.6, "#03060d");
  bgGradient.addColorStop(1, "#010204");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Grille HUD discrète en arrière-plan
  ctx.strokeStyle = "rgba(0, 210, 255, 0.03)";
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Cadre extérieur néon avec coins coupés style Sci-Fi
  ctx.strokeStyle = "rgba(0, 210, 255, 0.2)";
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 15, 15, width - 30, height - 30, 16);
  ctx.stroke();

  // ==========================================
  // 2. EN-TÊTE / HEADER
  // ==========================================
  ctx.textAlign = "center";
  
  // Titre principal
  ctx.font = "bold 26px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("SHADE QUANTUM", width / 2, 55);

  // Sous-titre
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#00d2ff";
  ctx.fillText(`SECURE FINANCIAL CORE • ${systemName.toUpperCase()}`, width / 2, 73);

  // Ligne de séparation sous le header
  const headerLine = ctx.createLinearGradient(200, 0, width - 200, 0);
  headerLine.addColorStop(0, "rgba(0, 210, 255, 0)");
  headerLine.addColorStop(0.5, "rgba(0, 210, 255, 0.5)");
  headerLine.addColorStop(1, "rgba(0, 210, 255, 0)");
  ctx.strokeStyle = headerLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 85);
  ctx.lineTo(width - 200, 85);
  ctx.stroke();

  // ==========================================
  // 3. CARTES UTILISATEURS (Gauche & Droite)
  // ==========================================
  const drawUserCard = async (x, y, w, h, isSender) => {
    // Fond carte semi-transparent
    ctx.fillStyle = "rgba(10, 18, 32, 0.65)";
    drawRoundedRect(ctx, x, y, w, h, 14);
    ctx.fill();

    // Bordure fine
    ctx.strokeStyle = isSender ? "rgba(0, 210, 255, 0.25)" : "rgba(255, 215, 0, 0.25)";
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, x, y, w, h, 14);
    ctx.stroke();

    const name = isSender ? senderName : receiverName;
    const avatar = isSender ? senderAvatar : receiverAvatar;
    const rank = isSender ? senderRank : receiverRank;
    const before = isSender ? senderBalanceBefore : receiverBalanceBefore;
    const after = isSender ? senderBalanceAfter : receiverBalanceAfter;
    const accentColor = isSender ? "#00d2ff" : "#ffd700";

    // Avatar
    const avatarX = x + 50;
    const avatarY = y + 55;
    if (avatar) {
      await drawCircularAvatar(ctx, avatar, avatarX, avatarY, 32, accentColor);
    }

    // Nom Utilisateur
    ctx.textAlign = "left";
    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#ffffff";
    const truncatedName = name.length > 14 ? name.substring(0, 12) + "..." : name;
    ctx.fillText(truncatedName, x + 98, y + 48);

    // Badge Rang (Doré)
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#ffd700";
    ctx.fillText(`[ ${rank.toUpperCase()} ]`, x + 98, y + 68);

    // Ligne interne de séparation
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 100);
    ctx.lineTo(x + w - 20, y + 100);
    ctx.stroke();

    // Détails des Soldes
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#8a99ad";
    ctx.fillText("Solde précédent", x + 25, y + 130);
    ctx.fillText("Nouveau solde", x + 25, y + 165);

    ctx.textAlign = "right";
    ctx.font = "bold 13px sans-serif";
    ctx.fillStyle = "#cccccc";
    ctx.fillText(`${Number(before).toLocaleString()} $`, x + w - 25, y + 130);

    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = accentColor;
    ctx.fillText(`${Number(after).toLocaleString()} $`, x + w - 25, y + 165);
  };

  // Rendu Expéditeur (Gauche) et Destinataire (Droite)
  await drawUserCard(40, 120, 280, 200, true);
  await drawUserCard(680, 120, 280, 200, false);

  // ==========================================
  // 4. CENTRE : CŒUR QUANTUM & MONTANT
  // ==========================================
  const centerX = width / 2;
  const centerY = 220;

  // Cercle extérieur pointillé HUD
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, 105, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 210, 255, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.restore();

  // Anneau interne plein avec lueur
  ctx.beginPath();
  ctx.arc(centerX, centerY, 85, 0, Math.PI * 2);
  ctx.strokeStyle = "#00d2ff";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cadre central rempli pour le montant
  ctx.fillStyle = "rgba(3, 8, 18, 0.9)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 83, 0, Math.PI * 2);
  ctx.fill();

  // Affichage du Montant (Accent Doré)
  ctx.textAlign = "center";
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#8a99ad";
  ctx.fillText("MONTANT TRANSFÉRÉ", centerX, centerY - 28);

  ctx.font = "bold 28px sans-serif";
  ctx.fillStyle = "#ffd700"; // Accent doré sur l'info critique
  ctx.fillText(`${Number(amount).toLocaleString()}`, centerX, centerY + 8);

  ctx.font = "bold 12px sans-serif";
  ctx.fillStyle = "#00d2ff";
  ctx.fillText("USD / CREDITS", centerX, centerY + 28);

  // Status Badge
  ctx.fillStyle = "rgba(0, 210, 255, 0.15)";
  drawRoundedRect(ctx, centerX - 50, centerY + 45, 100, 22, 11);
  ctx.fill();
  ctx.strokeStyle = "#00d2ff";
  ctx.lineWidth = 1;
  drawRoundedRect(ctx, centerX - 50, centerY + 45, 100, 22, 11);
  ctx.stroke();

  ctx.font = "bold 10px sans-serif";
  ctx.fillStyle = "#00d2ff";
  ctx.fillText("✓ VERIFIED", centerX, centerY + 59);

  // Flèches HUD directionnelles
  ctx.strokeStyle = "#00d2ff";
  ctx.lineWidth = 2;
  // Gauche vers centre
  ctx.beginPath();
  ctx.moveTo(330, centerY);
  ctx.lineTo(380, centerY);
  ctx.stroke();
  // Droite vers centre
  ctx.beginPath();
  ctx.moveTo(620, centerY);
  ctx.lineTo(670, centerY);
  ctx.stroke();

  // ==========================================
  // 5. PIED DE PAGE / FOOTER & TRANSACTION INFO
  // ==========================================
  const footerY = 400;

  // Panneau d'informations techniques
  ctx.fillStyle = "rgba(8, 14, 26, 0.8)";
  drawRoundedRect(ctx, 40, footerY, width - 80, 110, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.stroke();

  // Lignes de données (Grid Sci-Fi)
  ctx.textAlign = "left";
  ctx.font = "11px monospace";
  ctx.fillStyle = "#8a99ad";

  ctx.fillText(`TRANSACTION ID :`, 70, footerY + 40);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(transactionId, 185, footerY + 40);

  ctx.fillStyle = "#8a99ad";
  ctx.fillText(`TIMESTAMP      :`, 70, footerY + 70);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(date, 185, footerY + 70);

  // Bloc de sécurité holographique à droite du footer
  ctx.textAlign = "right";
  ctx.font = "10px monospace";
  ctx.fillStyle = "#00d2ff";
  ctx.fillText("PROTOCOL : QUANTUM-E2EE", width - 70, footerY + 40);
  ctx.fillStyle = "#8a99ad";
  ctx.fillText("BLOCK STATUS : CONFIRMED", width - 70, footerY + 70);

  // Signature officielle en bas
  ctx.textAlign = "center";
  ctx.font = "italic 11px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillText("Powered by Shade Quantum Engine", width / 2, height - 35);

  // Retourne le buffer PNG
  return canvas.toBuffer("image/png");
}

module.exports = { createTransferCard };
