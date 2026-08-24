const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, PermissionFlagsBits, SlashCommandBuilder, Routes, REST } = require('discord.js');
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
    
    spechereServerConfig(guildId, neueConfig);
    return neueConfig;
};

const spechereServerConfig = (guildId, config) => {
    const filePfad = path.join(CONFIG_DIR, `${guildId}.json`);
    fs.writeFileSync(filePfad, JSON.stringify(config, null, 4), 'utf-8');
};

const erstelleSlashCommands = () => {
    return new SlashCommandBuilder()
        .setName('karlheinz-config')
        .setDescription('Konfiguriere den Karl Heinz Bot für diesen Server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('anzeigen')
            .setDescription('Zeigt die aktuellen Einstellungen des Servers an')
        )
        .addSubcommand(sub => sub
            .setName('basis')
            .setDescription('Ändere die Grundeinstellungen')
            .addStringOption(o => o.setName('sprache').setDescription('Werkseinstellung für Sprüche-Pools').addChoices({name: 'Deutsch', value: 'de'}, {name: 'English', value: 'en'}, {name: 'Bayerisch', value: 'bar'}))
            .addIntegerOption(o => o.setName('nacht_start').setDescription('Stunde, ab der die Nachtruhe beginnt (0-23)'))
            .addIntegerOption(o => o.setName('nacht_end').setDescription('Stunde, in der die Nachtruhe endet (0-23)'))
            .addIntegerOption(o => o.setName('caps_prozent').setDescription('Ab wie viel Prozent Caps Lock der Bot reagiert (1-100)'))
        )
        .addSubcommand(sub => sub
            .setName('strafen')
            .setDescription('Ändere das Bestrafungssystem')
            .addStringOption(o => o.setName('caps_strafe').setDescription('Bestrafung für zu viel Caps Lock').addChoices({name: 'Keine', value: 'none'}, {name: 'Timeout (1 Minute)', value: 'timeout'}))
            .addStringOption(o => o.setName('nacht_strafe').setDescription('Bestrafung bei wiederholtem Verstoß gegen Nachtruhe').addChoices({name: 'Keine', value: 'none'}, {name: 'Timeout (1 Minute)', value: 'timeout'}))
            .addIntegerOption(o => o.setName('nacht_limit').setDescription('Anzahl an erlaubten Nachrichten in der Nacht vor der Strafe'))
        )
        .addSubcommand(sub => sub
            .setName('spruch-hinzufügen')
            .setDescription('Füge einen eigenen Spruch hinzu')
            .addStringOption(o => o.setName('typ').setDescription('Für welches System ist der Spruch?').setRequired(true).addChoices({name: 'Nachtruhe', value: 'night'}, {name: 'Caps Lock', value: 'caps'}))
            .addStringOption(o => o.setName('text').setDescription('Der eigentliche Text des Spruchs').setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName('spruch-löschen')
            .setDescription('Lösche einen Spruch anhand seines Indexes (siehe anzeigen)')
            .addStringOption(o => o.setName('typ').setDescription('Aus welchem System löschen?').setRequired(true).addChoices({name: 'Nachtruhe', value: 'night'}, {name: 'Caps Lock', value: 'caps'}))
            .addIntegerOption(o => o.setName('index').setDescription('Die Nummer des Spruchs aus /karlheinz-config anzeigen').setRequired(true))
        );
};

client.once('ready', async () => {
    console.log("Karl Heinz Web-Wacht läuft auf Port " + (process.env.PORT || 3000));
    try {
        const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: [erstelleSlashCommands().toJSON()] }
        );
    } catch (error) {}
});

setInterval(() => {
    const jetzt = new Date();
    if (jetzt.getHours() === 6 && jetzt.getMinutes() === 0) {
        cacheNachtZaehler.clear();
        cacheHatSchonMecker.clear();
        console.log("Karl Heinz hat de Listen g'leert. Auf ein Neues!");
    }
}, 60000);

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand() || !interaction.guildId) return;

    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();
    let sCfg = ladeServerConfig(guildId);

    if (subcommand === 'anzeigen') {
        let text = `**Aktuelle Karl Heinz Konfiguration:**\n`;
        text += `• Sprache (Werkseinstellung): \`${sCfg.language}\`\n`;
        text += `• Nachtruhe: von \`${sCfg.night_start}:00\` bis \`${sCfg.night_end}:00\` Uhr\n`;
        text += `• Caps Lock Empfindlichkeit: \`${sCfg.caps_percentage}%\`\n`;
        text += `• Caps Strafe: \`${sCfg.punishment_caps}\`\n`;
        text += `• Nachtruhe Strafe: \`${sCfg.punishment_night}\` (nach \`${sCfg.punishment_night_trigger_count}\` Nachrichten)\n\n`;
        
        text += `**Sprüche für Nachtruhe:**\n`;
        sCfg.custom_phrases.night.forEach((s, idx) => { text += `  \`[${idx}]\` ${s}\n`; });
        
        text += `\n**Sprüche für Caps Lock:**\n`;
        sCfg.custom_phrases.caps.forEach((s, idx) => { text += `  \`[${idx}]\` ${s}\n`; });

        return interaction.reply({ content: text, ephemeral: true });
    }

    if (subcommand === 'basis') {
        const neueSprache = interaction.options.getString('sprache');
        const nStart = interaction.options.getInteger('night_start');
        const nEnd = interaction.options.getInteger('night_end');
        const cProzent = interaction.options.getInteger('caps_prozent');

        if (neueSprache) {
            sCfg.language = neueSprache;
            sCfg.custom_phrases.night = configTemplate.phrases[neueSprache].night;
            sCfg.custom_phrases.caps = configTemplate.phrases[neueSprache].caps;
        }
        if (nStart !== null && nStart >= 0 && nStart <= 23) sCfg.night_start = nStart;
        if (nEnd !== null && nEnd >= 0 && nEnd <= 23) sCfg.night_end = nEnd;
        if (cProzent !== null && cProzent >= 1 && cProzent <= 100) sCfg.caps_percentage = cProzent;

        spechereServerConfig(guildId, sCfg);
        return interaction.reply({ content: "Basis-Einstellungen erfolgreich aktualisiert!", ephemeral: true });
    }

    if (subcommand === 'strafen') {
        const cStrafe = interaction.options.getString('caps_strafe');
        const nStrafe = interaction.options.getString('nacht_strafe');
        const nLimit = interaction.options.getInteger('nacht_limit');

        if (cStrafe) sCfg.punishment_caps = cStrafe;
        if (nStrafe) sCfg.punishment_night = nStrafe;
        if (nLimit !== null && nLimit >= 1) sCfg.punishment_night_trigger_count = nLimit;

        spechereServerConfig(guildId, sCfg);
        return interaction.reply({ content: "Strafen-Einstellungen erfolgreich aktualisiert!", ephemeral: true });
    }

    if (subcommand === 'spruch-hinzufügen') {
        const typ = interaction.options.getString('typ');
        const spruchText = interaction.options.getString('text');

        if (typ === 'night') sCfg.custom_phrases.night.push(spruchText);
        if (typ === 'caps') sCfg.custom_phrases.caps.push(spruchText);

        spechereServerConfig(guildId, sCfg);
        return interaction.reply({ content: "Spruch erfolgreich hinzugefügt!", ephemeral: true });
    }

    if (subcommand === 'spruch-löschen') {
        const typ = interaction.options.getString('typ');
        const index = interaction.options.getInteger('index');
        const liste = typ === 'night' ? sCfg.custom_phrases.night : sCfg.custom_phrases.caps;
        if (index >= 0 && index < liste.length) {
            liste.splice(index, 1);
            spechereServerConfig(guildId, sCfg);
            return interaction.reply({ content: "Spruch erfolgreich gelöscht!", ephemeral: true });
        } else {
            return interaction.reply({ content: "Ungültiger Index! Schau dir die Nummern mit /karlheinz-config anzeigen an.", ephemeral: true });
        }
    }
});
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
        const cacheKey = ${guildId}_${userId};
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
            if (nurBuchstaben[i] === nurBuchstaben[i].toUpperCase()) {grossBuchstaben++}
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
