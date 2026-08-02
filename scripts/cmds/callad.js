const { getStreamsFromAttachment } = global.utils;
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const fonts = require("../func/fonts.js");

const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];
const TARGET_GROUP_ID = "1290457223176689"; 

async function getAvatarBuffer(id, type = "user") {    
  try {        
    const url = type === "user"             
      ? `https://graph.facebook.com/${id}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`            
      : `https://graph.facebook.com/${id}/picture?type=large`;                    
    const response = await axios.get(url, { responseType: 'arraybuffer' });        
    return Buffer.from(response.data, 'binary');    
  } catch (e) {        
    const fallbackCanvas = createCanvas(150, 150);        
    const fCtx = fallbackCanvas.getContext('2d');        
    fCtx.fillStyle = '#f43f5e';        
    fCtx.beginPath();        
    fCtx.arc(75, 75, 75, 0, Math.PI * 2);        
    fCtx.fill();        
    return fallbackCanvas.toBuffer();    
  }
}

async function drawHoriCanvas(title, subText, mainContent, senderID, isGroup, threadID, groupName = "") {    
  const width = 1000;    
  const height = 580;    
  const canvas = createCanvas(width, height);    
  const ctx = canvas.getContext('2d');    
  
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);    
  bgGrad.addColorStop(0, '#4c0519');    
  bgGrad.addColorStop(0.5, '#881337');     
  bgGrad.addColorStop(1, '#f43f5e');    
  ctx.fillStyle = bgGrad;    
  ctx.fillRect(0, 0, width, height);    
  
  function drawSakuraPetal(cx, cy, r) {        
    ctx.save();        
    ctx.beginPath();        
    ctx.translate(cx, cy);        
    for (let i = 0; i < 5; i++) {            
      ctx.rotate(Math.PI * 2 / 5);            
      ctx.moveTo(0, 0);            
      ctx.bezierCurveTo(-r/2, -r, -r, -r*1.5, 0, -r*1.2);            
      ctx.bezierCurveTo(r, -r*1.5, r/2, -r, 0, 0);        
    }        
    ctx.closePath();        
    ctx.fill();        
    ctx.restore();    
  }    
  
  ctx.fillStyle = 'rgba(251, 113, 133, 0.15)';    
  drawSakuraPetal(100, 100, 45);    
  drawSakuraPetal(880, 120, 50);    
  drawSakuraPetal(150, 480, 35);    
  drawSakuraPetal(900, 460, 40);    
  
  ctx.strokeStyle = '#22d3ee';    
  ctx.lineWidth = 3;    
  ctx.strokeRect(15, 15, width - 30, height - 30);    
  ctx.strokeStyle = '#f43f5e';    
  ctx.lineWidth = 2;    
  ctx.strokeRect(22, 22, width - 44, height - 44);    
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';    
  ctx.beginPath();    
  if (ctx.roundRect) {        
    ctx.roundRect(50, 40, 900, 160, 16);    
  } else {        
    ctx.rect(50, 40, 900, 160);    
  }    
  ctx.fill();    
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';    
  ctx.stroke();    
  
  try {        
    const avatarBuffer = await getAvatarBuffer(senderID, "user");        
    const img = await loadImage(avatarBuffer);        
    ctx.save();        
    ctx.beginPath();        
    ctx.arc(140, 120, 55, 0, Math.PI * 2);        
    ctx.clip();        
    ctx.drawImage(img, 85, 65, 110, 110);        
    ctx.restore();        
    ctx.strokeStyle = '#f43f5e';        
    ctx.lineWidth = 4;        
    ctx.beginPath();        
    ctx.arc(140, 120, 55, 0, Math.PI * 2);        
    ctx.stroke();    
  } catch (_) {}    
  
  if (isGroup && threadID) {        
    try {            
      const groupBuffer = await getAvatarBuffer(threadID, "group");            
      const gImg = await loadImage(groupBuffer);            
      ctx.save();            
      ctx.beginPath();            
      ctx.arc(880, 120, 40, 0, Math.PI * 2);            
      ctx.clip();            
      ctx.drawImage(gImg, 840, 80, 80, 80);            
      ctx.restore();            
      ctx.strokeStyle = '#fb923c';            
      ctx.lineWidth = 3;            
      ctx.beginPath();            
      ctx.arc(880, 120, 40, 0, Math.PI * 2);            
      ctx.stroke();        
    } catch (_) {}    
  }    
  
  ctx.textAlign = 'left';    
  ctx.textBaseline = 'middle';        
  const titleGrad = ctx.createLinearGradient(220, 0, 600, 0);    
  titleGrad.addColorStop(0, '#ffffff');    
  titleGrad.addColorStop(0.5, '#f43f5e');    
  titleGrad.addColorStop(1, '#fb923c');        
  ctx.fillStyle = titleGrad;    
  ctx.font = 'bold 38px Arial';    
  ctx.fillText(`🌸 ${title}`, 220, 85);    
  ctx.fillStyle = '#fecdd3';    
  ctx.font = 'italic 18px Arial';    
  ctx.fillText(subText, 220, 135);    
  
  if (isGroup && groupName) {        
    ctx.fillStyle = '#99f6e4';        
    ctx.font = '14px Arial';        
    ctx.fillText(`📍 Origin: ${groupName}`, 220, 165);    
  }    
  
  const msgBoxX = 50;    
  const msgBoxY = 225;    
  const msgBoxW = 900;    
  const msgBoxH = 260;    
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';    
  ctx.beginPath();    
  if (ctx.roundRect) {        
    ctx.roundRect(msgBoxX, msgBoxY, msgBoxW, msgBoxH, [0, 24, 24, 24]);    
  } else {        
    ctx.rect(msgBoxX, msgBoxY, msgBoxW, msgBoxH);    
  }    
  ctx.fill();    
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';    
  ctx.lineWidth = 2;    
  ctx.stroke();    
  
  ctx.fillStyle = '#ffffff';    
  ctx.font = 'bold 24px Arial';    
  ctx.textBaseline = 'top';        
  const words = mainContent.split(' ');    
  let line = '';    
  let x = 80;    
  let y = 260;    
  const maxWidth = 840;    
  const lineHeight = 38;    
  
  for (let n = 0; n < words.length; n++) {        
    let testLine = line + words[n] + ' ';        
    let metrics = ctx.measureText(testLine);        
    if (metrics.width > maxWidth && n > 0) {            
      ctx.fillText(line, x, y);            
      line = words[n] + ' ';            
      y += lineHeight;        
    } else {            
      line = testLine;        
    }    
  }    
  ctx.fillText(line, x, y);    
  
  ctx.textAlign = 'center';    
  ctx.textBaseline = 'middle';    
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';    
  ctx.font = 'bold 13px Arial';    
  ctx.fillText('🌸 HORI-STYLE SYSTEM SUPPORT • CHAT BOT 🌸', width / 2, height - 50);    
  
  const cacheDir = path.join(__dirname, 'cache');    
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });    
  const cachePath = path.join(cacheDir, `hori_canvas_${Date.now()}.png`);    
  fs.writeFileSync(cachePath, canvas.toBuffer('image/png'));        
  return cachePath;
}

module.exports = {    
  config: {        
    name: "callad",        
    version: "4.5.1",        
    author: "Shade × Gemini",        
    countDown: 5,        
    role: 0,        
    description: { fr: "Envoie un rapport haut de gamme aux administrateurs sous forme de carte vectorielle Hori." },        
    category: "contacts admin",        
    guide: { fr: "{pn} <votre message>" }    },    
  
  langs: {        
    fr: {            
      missingMessage: "Ecris le message que tu souhaites transmettre a l'administration.",            
      sendByGroup: "\n» Groupe emetteur : %1\n» ID Groupe : %2",            
      sendByUser: "\n» Envoyé depuis les messages prives",            
      content: "\n\n━━━━━━━━━━━━━━━━━━━━━━\n📬 | RAPPORT ENTRANT :\n%1\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 | Repondez à ce message pour notifier l'utilisateur de votre decision.",            
      success: "Message converti et transmis avec succes sur le terminal admin !",            
      failed: "Echec de la liaison vers le groupe de support.",            
      reply: "REPONSE DE L'ADMINISTRATION\n\n💬 | L'administrateur %1 vous repond :\n\n%2\n\n💡 | Tu peux repondre a ce message si tu as besoin de rajouter des precisions.",            
      replySuccess: "Ta decision a ete renvoyee a l'utilisateur !",            
      feedback: "RELANCE DE L'UTILISATEUR\n\n» De : %1\n» ID : %2%3\n\n📬 | Nouveau message :\n%4",            
      replyUserSuccess: "Terminal mis a jour avec le nouveau rapport utilisateur."        }    },    
  
  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {        
    try {            
      if (!args[0]) return message.reply(fonts.christus("⚠️ | " + getLang("missingMessage")));            
      const { senderID, threadID, isGroup } = event;                        
      
      const senderName = await usersData.getName(senderID);            
      let groupName = "";            
      let locationText = getLang("sendByUser");            
      if (isGroup) {                
        const threadInfo = await threadsData.get(threadID);                
        groupName = threadInfo.threadName || `Groupe #${threadID}`;                
        locationText = getLang("sendByGroup", groupName, threadID);            
      }            
      
      const mainMsg = args.join(" ");            
      const canvasImagePath = await drawHoriCanvas("CALL ADMIN", `Par : ${senderName} (ID: ${senderID})`, mainMsg, senderID, isGroup, threadID, groupName);            
      
      const msgTitle = fonts.bold("ALERTE SYSTEME") + "\n\n";
      const msg = msgTitle                
        + `» Utilisateur : ${senderName}\n`                
        + `» ID : ${senderID}`                
        + locationText;            
      
      const attachments = await getStreamsFromAttachment(                
        [...event.attachments, ...(event.messageReply?.attachments || [])].filter(item => mediaTypes.includes(item.type))            );            
      
      if (fs.existsSync(canvasImagePath)) attachments.push(fs.createReadStream(canvasImagePath));            
      
      const formMessage = {                
        body: fonts.christus(msg + getLang("content", mainMsg)),                
        mentions: [{ id: senderID, tag: senderName }],                
        attachment: attachments            };            
      
      try {                
        const messageSend = await api.sendMessage(formMessage, TARGET_GROUP_ID);                
        global.GoatBot.onReply.set(messageSend.messageID, {                    
          commandName,                    
          messageID: messageSend.messageID,                    
          threadID,                    
          messageIDSender: event.messageID,                    
          type: "userCallAdmin"                });                
        setTimeout(() => { try { fs.unlinkSync(canvasImagePath); } catch(_) {} }, 5000);                
        return message.reply(fonts.christus("✅ | " + getLang("success")));            
      } catch (err) {                
        setTimeout(() => { try { fs.unlinkSync(canvasImagePath); } catch(_) {} }, 5000);                
        return message.reply(fonts.christus("❌ | " + getLang("failed")));            }        } catch (error) {            
      return message.reply(fonts.christus("❌ | Une erreur interne est survenue."));        }    },    
  
  onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {        
    try {            
      const { type, threadID, messageIDSender } = Reply;            
      const senderName = await usersData.getName(event.senderID);            
      const { isGroup, senderID } = event;            
      const replyMsg = args.join(" ");            
      
      const { config } = global.GoatBot;            
      const isBotAdmin = config.adminBot.includes(senderID);            
      
      switch (type) {                
        case "userCallAdmin": {                    
          if (!isBotAdmin) {                        
            return api.sendMessage(fonts.christus("⛔ | Acces refuse : Tu n'as pas l'autorisation d'administrateur pour repondre a ce ticket."), event.threadID, event.messageID);                    }                    
          
          const canvasImagePath = await drawHoriCanvas("REPONSE ADMINISTRATEUR", `Redigee par : ${senderName}`, replyMsg, event.senderID, isGroup, event.threadID);                    
          const attachments = await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)));                    
          if (fs.existsSync(canvasImagePath)) attachments.push(fs.createReadStream(canvasImagePath));                    
          
          const formMessage = {                        
            body: fonts.christus(getLang("reply", senderName, replyMsg)),                        
            mentions: [{ id: event.senderID, tag: senderName }],                        
            attachment: attachments                    };                    
          
          api.sendMessage(formMessage, threadID, (err, info) => {                        
            setTimeout(() => { try { fs.unlinkSync(canvasImagePath); } catch(_) {} }, 5000);                        
            if (err) return message.err(err);                        
            message.reply(fonts.christus("✅ | " + getLang("replySuccess")));                        
            global.GoatBot.onReply.set(info.messageID, {                            
              commandName,                            
              messageID: info.messageID,                            
              messageIDSender: event.messageID,                            
              threadID: event.threadID,                            
              type: "adminReply"                        });                    }, messageIDSender);                    
          break;                }                
        case "adminReply": {                    
          let sendByGroup = "";                    
          let groupName = "";                    
          if (isGroup) {                        
            try {                            
              const threadInfo = await api.getThreadInfo(event.threadID);                            
              groupName = threadInfo.threadName;                            
              sendByGroup = getLang("sendByGroup", groupName, event.threadID);                        } catch(_) {}                    }                    
          
          const canvasImagePath = await drawHoriCanvas("NOUVEAU RETOUR", `Soumis par : ${senderName}`, replyMsg, event.senderID, isGroup, event.threadID, groupName);                    
          const attachments = await getStreamsFromAttachment(event.attachments.filter(item => mediaTypes.includes(item.type)));                    
          if (fs.existsSync(canvasImagePath)) attachments.push(fs.createReadStream(canvasImagePath));                    
          
          const formMessage = {                        
            body: fonts.christus(getLang("feedback", senderName, event.senderID, sendByGroup, replyMsg)),                        
            mentions: [{ id: event.senderID, tag: senderName }],                        
            attachment: attachments                    };                    
          
          api.sendMessage(formMessage, TARGET_GROUP_ID, (err, info) => {                        
            setTimeout(() => { try { fs.unlinkSync(canvasImagePath); } catch(_) {} }, 5000);                        
            if (err) return message.err(err);                        
            message.reply(fonts.christus("✅ | " + getLang("replyUserSuccess")));                        
            global.GoatBot.onReply.set(info.messageID, {                            
              commandName,                            
              messageID: info.messageID,                            
              messageIDSender: event.messageID,                            
              threadID: event.threadID,                            
              type: "userCallAdmin"                        });                    }, messageIDSender);                    
          break;                }                
        default:                    
          break;            }        } catch (error) {            
      console.error(error);        }    }
};
