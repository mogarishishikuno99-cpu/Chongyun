module.exports.config = {
    name: "hentai",
    version: "1.0.1",
    role: 0,
    credits: "Shade",
    description: "Récupère une vidéo d'anime aléatoire",
    commandCategory: "other", // Ajout de la catégorie ici pour le menu d'aide
    hasPrefix: true,
    usages: "hentai",
    cooldowns: 5
};

module.exports.onStart = async function ({ api, event, message }) {
    try {
        // Envoi d'un message temporaire pour faire patienter l'utilisateur
        message.reply("⏳ Récupération de la vidéo hentai 🔞 en cours...");

        const response = await fetch('https://arychauhann.onrender.com/api/hentai');
        
        if (!response.ok) {
            return message.reply("❌ Impossible de contacter l'API pour le moment.");
        }

        const data = await response.json();
        const listeHentais = Object.values(data);
        
        // Sélectionne un anime au hasard dans la liste
        const hentaiAleatoire = listeHentais[Math.floor(Math.random() * listeHentais.length)];

        const lienVideo = hentaiAleatoire.video_2 || hentaiAleatoire.video_1 || hentaiAleatoire.link;
        
        if (!lienVideo) {
            return message.reply("❌ Aucune vidéo trouvée dans cette entrée.");
        }

        // Texte descriptif à envoyer avec la vidéo
        const descriptionText = `🔞 **Hentai Trouvé** 🔞\n\n` +
                                `👤 Catégorie : ${hentaiAleatoire.category || 'Non spécifiée'}\n` +
                                `👀 Vues : ${hentaiAleatoire.views_count || '0'}\n` +
                                `🔄 Partages : ${hentaiAleatoire.share_count || '0'}`;

        // Envoi du texte avec le flux de la vidéo en pièce jointe (attachment) via un stream de l'URL
        const videoStream = await api.getStreamFromURL(lienVideo);

        return message.reply({
            body: descriptionText,
            attachment: videoStream
        });

    } catch (error) {
        console.error(error);
        return message.reply("❌ Une erreur est survenue lors du traitement de la commande.");
    }
};
