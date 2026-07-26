module.exports = {
  config: {
    name: "ping",
    aliases: ["latency", "ms"],
    version: "1.0.0",
    author: "Shade × Gemini",
    role: 0,
    category: "system",
    shortDescription: "Vérifie la latence et le temps de réponse du bot",
    guide: "{pn}"
  },

  onStart: async function ({ message, event }) {
    const timeStart = Date.now();

    // Envoi du message initial pour calculer le délai d'aller-retour
    const sentMsg = await message.reply("🏓 Pong ! Calcul de la latence...");

    const timeEnd = Date.now();
    const latency = timeEnd - timeStart;

    let status = "🟢 Excellente";
    if (latency > 200) status = "🟡 Moyenne";
    if (latency > 500) status = "🔴 Lente";

    return message.reply(
      `🏓 **PONG !**\n\n` +
      `⚡ **Latence :** \`${latency} ms\`\n` +
      `📊 **État du réseau :** ${status}`
    );
  }
};
