const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});
const nachtZaehler = new Map();
const hatSchonMeckerBekommen = new Set();
setInterval(() => {
    const jetzt = new Date();
    if (jetzt.getHours() === 6 && jetzt.getMinutes() === 0) {
        nachtZaehler.clear();
        hatSchonMeckerBekommen.clear();
        console.log("Karl Heinz hat die Listen g'leert. Auf ein Neues!");
    }
}, 60000);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const jetzt = new Date().getHours();
    const userId = message.author.id;

    if (jetzt >= 22 || jetzt < 6) {
        if (!hatSchonMeckerBekommen.has(userId)) {
            let count = (nachtZaehler.get(userId) || 0) + 1;
            nachtZaehler.set(userId, count);

            if (count === 4) {
                await message.reply("Himmisakra, schleich di ins Bett! Warum bist’n du no auf? Es is scho längst Schofnszeit, du Hanswurscht!");
                hatSchonMeckerBekommen.add(userId);
            }
        }
    }
    const buchstaben = message.content.replace(/[^a-zA-ZäöüÄÖÜß]/g, ""); 
    if (buchstaben.length > 4) { 
        const grossBuchstaben = buchstaben.split("").filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length;
        if (grossBuchstaben / buchstaben.length >= 0.8) {
            await message.reply("Sakradi, etz fahr halt mal wieder runter! Was fluchst’n so rum? Des holds ja im Kopf ned aus!");
        }
    }
});
client.login(process.env.BOT_TOKEN);
