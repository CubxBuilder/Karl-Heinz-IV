const http = require('http');
const fs = require('fs');
const path = require('path');

// Webserver Setup für die statischen Seiten
http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    if (filePath === './terms-of-use') filePath = './terms-of-use.html';
    if (filePath === './privacy-policy') filePath = './privacy-policy.html';

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404);
                res.end("Karl Heinz findt de Seitn ned! (404)");
            } else {
                res.writeHead(500);
                res.end("Da hat's was g'scheppert: " + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(process.env.PORT || 3000, () => {
    console.log("Karl Heinz Web-Wacht läuft auf Port " + (process.env.PORT || 3000));
});

// Discord Bot Setup
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
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
    "Ja kruzitürken, etz is aber moi guad mit dem Gebrüll hier!",
    "Himmiseidank, etz hoid doch amoi de Finger still! Des G'schrei liest ja koana freiwillig!",
    "Etz is aber a Ruh! I bin ja ned schwerhörig, bloß weil i alt bin!",
    "Ja bist du denn vom Wuiderer bissen? Schreib g'fälligst normal, du Dampfplauderer!",
    "Samma, brennt dir der Huat? De Tastatur is zum Tippen da, ned zum Draufhaun!",
    "Mei, so a G'schrei... bist du auf da Wiesn aufgwachsen oder was?",
    "I glab, dir ham's ins Hirn g'regnet! Schreib leiser, i krieg ja Kopfweh!",
    "G'hert des etz zum guten Ton bei de Jungen, dass ma ois so aufblosn muss?",
    "Sakrament! Mäßig di, sonst sperr i di in den Saupreißn-Modus!",
    "Host du koan Anstand g'lernt? Ma brüllt ned so rum in meim Haus!",
    "Ja kruzifix, etz lass amoi den Dampf ab! Des hoid ja koa Kuh auf da Weide aus!",
    "Hoid de Bappn! Wer so laut schreibt, hat meistens eh nix G'scheits zum Sogn!",
    "Sakra, etz fangt der scho wieder an! Bist du a kleiner Giftzwerg oder was?",
    "Mei Liaber, wennst so weitermachst, zieh i dir d'Lederhosn über d'Ohrn!",
    "Geh weida, des G'schrei is ja zum Davalaffa! Benimm di amoi!",
    "Was is’n des für a Tonart? Hier drin werd g'fälligst g'sittet g'redt!",
    "Du Zipfeklatscher, moanst du wirklich, i liest des eher, wennst so rumblärrst?",
    "Etz langts aber! I hab scho g'hört, dass du da bist, des musst ned so rausschreia!",
    "Ja pfiat di Gott, was für a Lärm! Host du dei Kinderstube im Bierzelt g'habt?",
    "Heit is wieder schlimm mit dir... etz fahr die Kralln ei und schreib normal!"
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
