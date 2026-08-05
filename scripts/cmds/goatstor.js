const axios = require("axios");
const GoatStor = "https://goatstore.vercel.app";
const fonts = require("../func/fonts.js");

module.exports = {
  config: {
    name: "goatstor",
    aliases: ["gs", "market"],
    version: "2.0.1 Hori Pro",
    role: 0,
    author: "ArYAN × Shade",
    shortDescription: {
      en: "Marketplace de commandes pour l'écosystème GoatBot"
    },
    category: "utility",
    cooldowns: 2,
  },
  onStart: async ({ api, event, args, message }) => {
    const send = (txt) => message.reply(txt);
    try {
      if (!args[0]) {
        return send(
          fonts.christus(
            `✨ 🌸 [ MARKETPLACE GOATSTOR ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Commandes disponibles :\n» 📦 goatstor show [id] ⟶ Inspecter un module spécifié\n» 📄 goatstor page [num] ⟶ Parcourir le catalogue\n» 🔍 goatstor search [nom] ⟶ Rechercher un script\n» 🔥 goatstor trending ⟶ Afficher les modules populaires\n» 💝 goatstor like [id] ⟶ Attribuer une mention j'aime`
          )
        );
      }
      const cmd = args[0].toLowerCase();
      switch (cmd) {
        // 📦 SHOW (Détails d'un item)
        case "show": {
          const id = parseInt(args[1]);
          if (isNaN(id)) {
            return send(fonts.christus("✨ 🌸 [ ALERTE MARKET ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n❌ Veuillez fournir un identifiant numérique valide."));
          }
          const response = await axios.get(`${GoatStor}/api/item/${id}`);
          const item = response.data;
          if (!item || !item.itemName) {
            return send(fonts.christus("✨ 🌸 [ COMPOSANT INTROUVABLE ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n❌ Aucun module ne correspond à cet identifiant dans la base de données."));
          }
          return send(
            fonts.christus(
              `✨ 🌸 [ MODULE : ${item.itemName.toUpperCase()} ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n🆔 Identifiant : ${item.itemID}\n⚙️ Type d'architecture : ${item.type || "Non défini"}\n📝 Description : ${item.description || "Aucune description fournie."}\n👑 Développeur : ${item.authorName || "Anonyme"}\n📊 Statistiques globales :\n👀 Vues : ${item.views || 0}  |  💝 Likes : ${item.likes || 0}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔗 Code source brut (Raw) :\n${GoatStor}/raw/${item.rawID}`
            )
          );
        }
        // 📄 PAGE (Navigation)
        case "page": {
          const page = parseInt(args[1]) || 1;
          const response = await axios.get(`${GoatStor}/api/items?page=${page}&limit=5`);
          const items = response.data?.items || [];
          if (items.length === 0) {
            return send(fonts.christus(`✨ 🌸 [ FIN DE CATALOGUE ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n❌ Aucun module disponible à la page ${page}.`));
          }
          const list = items
            .map(
              (it, i) =>
                `🌸 ${i + 1}. ${it.itemName}\n🔹 ID : ${it.itemID}  •  💝 ${it.likes || 0} likes  •  👀 ${it.views || 0} vues`
            )
            .join("\n\n");
          return send(
            fonts.christus(
              `✨ 🌸 [ INDEX GOATSTOR • PAGE ${page} ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 Utilisez "goatstor show [id]" pour récupérer le code d'un script.`
            )
          );
        }
        // 🔍 SEARCH (Recherche textuelle)
        case "search": {
          const q = args.slice(1).join(" ");
          if (!q) {
            return send(fonts.christus("✨ 🌸 [ INDEX MANQUANT ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n❌ Veuillez spécifier les mots-clés ou le nom du module à rechercher."));
          }
          const response = await axios.get(`${GoatStor}/api/items?search=${encodeURIComponent(q)}`);
          const items = response.data?.items || [];
          if (items.length === 0) {
            return send(fonts.christus(`✨ 🌸 [ RECHERCHE INFRUCTUEUSE ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n❌ Aucun résultat trouvé pour la requête : "${q}".`));
          }
          const list = items
            .slice(0, 5)
            .map(
              (it, i) =>
                `🌸 ${i + 1}. ${it.itemName}\n🔹 ID de liaison : ${it.itemID}  [ 💝 Likes : ${it.likes || 0} ]`
            )
            .join("\n\n");
          return send(fonts.christus(`✨ 🌸 [ RÉSULTATS RECHERCHE : "${q.toUpperCase()}" ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n${list}`));
        }
        // 🔥 TRENDING (Populaires)
        case "trending": {
          const response = await axios.get(`${GoatStor}/api/trending`);
          const data = response.data || [];
          if (data.length === 0) {
            return send(fonts.christus("✨ 🌸 [ SYNCHRONISATION IMPOSSIBLE ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n❌ Aucune donnée de tendance n'est actuellement disponible."));
          }
          const list = data
            .slice(0, 5)
            .map(
              (it, i) =>
                `🔥 ${i + 1}. ${it.itemName}\n🔹 ID : ${it.itemID}  [ 💝 ${it.likes || 0}  |  👀 ${it.views || 0} ]`
            )
            .join("\n\n");
          return send(fonts.christus(`✨ 🌸 [ MODULES LES PLUS VOGUES ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n${list}`));
        }
        // 💝 LIKE (Aimer un item)
        case "like": {
          const id = parseInt(args[1]);
          if (isNaN(id)) {
            return send(fonts.christus("✨ 🌸 [ ID INVALIDATED ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n❌ Indiquez l'ID numérique du module pour lui attribuer un vote."));
          }
          const response = await axios.post(`${GoatStor}/api/items/${id}/like`);
          return send(
            fonts.christus(
              `✨ 🌸 [ TRANSACTION MISE À JOUR ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n💝 Votre mention j'aime a été enregistrée avec succès.\n📈 Nouveau score d'approbation : ${response.data?.likes || "Mis à jour"} likes.`
            )
          );
        }
        default:
          return send(fonts.christus("✨ 🌸 [ PROTOCOLE INCONNU ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n❌ Option invalide. Tapez la commande sans argument pour voir le guide."));
      }
    } catch (e) {
      console.error("GoatStor core crash:", e.message);
      return send(fonts.christus("✨ 🌸 [ DISRUPT SYSTEM / ERREUR ] 🌸 ✨\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n💔 Le serveur de dépôt distant est instable ou injoignable pour le moment."));
    }
  }
};
