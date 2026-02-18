const http = require('http');
http.createServer((req, res) => {
  res.write("Karl Heinz schläft ned, er wacht!");
  res.end();
}).listen(process.env.PORT || 3000);
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});
const nachtZaehler = new Map();
const hatSchonMeckerBekommen = new Set();
const nachtSprueche = [
    "Himmisakra, schleich di ins Bett! Warum bist’n du no auf? Es is scho längst Schofnszeit, du Hanswurscht!",
    "Ja sakra, brennt bei dir no Licht? Ab in d'Falle, bevor i grantig werd!",
    "Host du koa Dahoam? Schleich di endlich in d'Heia, du Nachtgigerl!",
    "Es is nach Zehne! Wer etz no schreibt, g’hert mit da Lederhosn verhaun. Ab ins Bett!",
    "Mei, i glab des ned... host du koane Eltern, die dir des Licht ausmachn? Schofnszeit is!",
    "Zua is! De Sperrstund war scho längst. Geh pennen, du Zipfelklatscher!",
    "Etz is Schluß mit dem Schmarrn! I mog nix mehr hern, es werd etz g’schlofn!",
    "Samma, bist du a Nachteuln? In deim Alter war i scho längst im Traumland. Abmarsch!",
    "Heit gibt’s koa Gaudi mehr. Pack di, sunst hol i an Besn raus!",
    "Kruzifix, es is Nacht! Ruah is etz aufm Server, sonst scheppert’s!"
];
const capsSprueche = [
    "Sakradi, etz fahr halt mal wieder runter! Was fluchst’n so rum? Des holds ja im Kopf ned aus!",
    "Schrei mi ned so an, du Rotzlöffel! I steh direkt vor dir!",
    "Ja bittschee, mäßig di im Ton! Wir san hier ned am Viehmarkt!",
    "Host an Vogel? Geh woanders rumschreia, du ungezogener Bua!",
    "Zefix! Mei Hörgerät pfeift scho, so wie du hier rumplärrst!",
    "Etz hoids moi de Goschn mit deiner Schreierei. Des is ja grausam!",
    "Geh weida, reg di ab! Trink a Maß, dann wirst wieder ruhiger!",
    "Sakra, musst du so brülln? Davo werd dei Schmarrn a ned g’scheiter!",
    "Hoid amoi de Luft o! Wer so schreit, hat eh koane Argumente mehr!",
    "Ja kruzitürken, etz is aber moi guad mit dem Gebrüll hier!"
];
const gibSpruch = (liste) => liste[Math.floor(Math.random() * liste.length)];

setInterval(() => {
    const jetzt = new Date();
    if (jetzt.getHours() === 6 && jetzt.getMinutes() === 0) {
        nachtZaehler.clear();
        hatSchonMeckerBekommen.clear();
        console.log("Karl Heinz hat de Listen g'leert. Auf ein Neues!");
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
                await message.reply(gibSpruch(nachtSprueche));
                hatSchonMeckerBekommen.add(userId);
            }
        }
    }
    const buchstaben = message.content.replace(/[^a-zA-ZäöüÄÖÜß]/g, ""); 
    if (buchstaben.length > 4) { 
        const grossBuchstaben = buchstaben.split("").filter(c => c === c.toUpperCase() && c !== c.toLowerCase()).length;
        if (grossBuchstaben / buchstaben.length >= 0.8) {
            await message.reply(gibSpruch(capsSprueche));
        }
    }
});
client.login(process.env.BOT_TOKEN);
