const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');
const configTemplate = require('./server-config-template');

const CONFIG_DIR = path.join(__dirname, 'configs');
if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR);
}

http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    if (filePath === './terms-of-use') filePath = './terms-of-use.html';
    if (filePath === './privacy-policy') filePath = './privacy-policy.html';
    
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
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
        }
    });
}).listen(process.env.PORT || 3000, () => {
    console.log("Karl Heinz Web-Wacht läuft auf Port " + (process.env.PORT || 3000));
});

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

const cacheNachtZaehler = new Map();
const cacheHatSchonMecker = new Set();

const gibSpruch = (liste) => {
    if (!liste || liste.length === 0) return "Karl Heinz beobachtet dich.";
    return liste[Math.floor(Math.random() * liste.length)];
};

const ladeServerConfig = (guildId) => {
    const filePfad = path.join(CONFIG_DIR, `${guildId}.json`);
    if (fs.existsSync(filePfad)) {
        return JSON.parse(fs.readFileSync(filePfad, 'utf-8'));
    }
    
    const neueConfig = {
        language: configTemplate.language,
        night_start: configTemplate.night_start,
        night_end: configTemplate.night_end,
        caps_percentage: configTemplate.caps_percentage,
        punishment_caps: configTemplate.punishment_caps,
        punishment_night: configTemplate.punishment_night,
        punishment_night_trigger_count: configTemplate.punishment_night_trigger_count,
        custom_phrases: {
            night: configTemplate.phrases[configTemplate.language].night,
            caps: configTemplate.phrases[configTemplate.language].caps
        }
    };
    
    fs.writeFileSync(filePfad, JSON.stringify(neueConfig, null, 4), 'utf-8');
    return neueConfig;
};

setInterval(() => {
    const jetzt = new Date();
    if (jetzt.getHours() === 6 && jetzt.getMinutes() === 0) {
        cacheNachtZaehler.clear();
        cacheHatSchonMecker.clear();
        console.log("Karl Heinz hat de Listen g'leert. Auf ein Neues!");
    }
}, 60000);

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const text = message.content;
    const jetztStunde = new Date().getHours();
    
    const sCfg = ladeServerConfig(guildId);
    const spruchListeNight = sCfg.custom_phrases?.night || [];
    const spruchListeCaps = sCfg.custom_phrases?.caps || [];

    let istNacht = false;
    if (sCfg.night_start > sCfg.night_end) {
        if (jetztStunde >= sCfg.night_start || jetztStunde < sCfg.night_end) istNacht = true;
    } else {
        if (jetztStunde >= sCfg.night_start && jetztStunde < sCfg.night_end) istNacht = true;
    }

    if (istNacht) {
        const cacheKey = `${guildId}_${userId}`;
        if (!cacheHatSchonMecker.has(cacheKey)) {
            cacheHatSchonMecker.add(cacheKey);
            await message.reply(gibSpruch(spruchListeNight));
        }

        const aktuelleNachrichten = cacheNachtZaehler.get(cacheKey) || 0;
        const neueAnzahl = aktuelleNachrichten + 1;
        cacheNachtZaehler.set(cacheKey, neueAnzahl);

        if (sCfg.punishment_night === "timeout" && neueAnzahl >= sCfg.punishment_night_trigger_count) {
            try {
                if (message.member && message.member.moderatable) {
                    await message.member.timeout(60 * 1000, "Nachtruhe missachtet");
                    await message.channel.send(`<@${userId}> wurde für eine Minute schweigend ins Eck gestellt (Nachtruhe).`);
                }
            } catch (e) {}
        }
    }

    const nurBuchstaben = text.replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
    if (nurBuchstaben.length >= 4) {
        let grossBuchstaben = 0;
        for (let i = 0; i < nurBuchstaben.length; i++) {
            if (nurBuchstaben[i] === nurBuchstaben[i].toUpperCase()) {
                grossBuchstaben++;
            }
        }
        
        const tatsaechlichProzent = (grossBuchstaben / nurBuchstaben.length) * 100;
        
        if (tatsaechlichProzent >= sCfg.caps_percentage) {
            await message.reply(gibSpruch(spruchListeCaps));
            
            if (sCfg.punishment_caps === "timeout") {
                try {
                    if (message.member && message.member.moderatable) {
                        await message.member.timeout(60 * 1000, "Zu viel Caps Lock");
                    }
                } catch (e) {}
            }
        }
    }
});

client.login(process.env.BOT_TOKEN);
