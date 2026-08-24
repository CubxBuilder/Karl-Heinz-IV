const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
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
        punishment_caps_timeout: configTemplate.punishment_caps_timeout,
        punishment_caps_delete: configTemplate.punishment_caps_delete,
        punishment_night_timeout: configTemplate.punishment_night_timeout,
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

const baueHauptmenue = (sCfg, menuAuthorId) => {
    const ui = configTemplate.ui[sCfg.language];
    const embed = new EmbedBuilder()
        .setTitle(ui.main_title)
        .setDescription(ui.main_desc)
        .setColor(0x3498db)
        .addFields(
            { name: "Language / Sprache", value: `\`${sCfg.language}\``, inline: true },
            { name: "Night / Nachtruhe", value: `\`${sCfg.night_start}:00\` - \`${sCfg.night_end}:00\``, inline: true },
            { name: "Caps Lock", value: `\`${sCfg.caps_percentage}%\``, inline: true },
            { name: "Caps Delete", value: `\`${sCfg.punishment_caps_delete ? "ON" : "OFF"}\``, inline: true },
            { name: "Caps Timeout", value: `\`${sCfg.punishment_caps_timeout > 0 ? sCfg.punishment_caps_timeout + " min" : "OFF"}\``, inline: true },
            { name: "Night Timeout", value: `\`${sCfg.punishment_night_timeout > 0 ? sCfg.punishment_night_timeout + " min (after " + sCfg.punishment_night_trigger_count + " msgs)" : "OFF"}\``, inline: true }
        );

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cfg_menu_phrases_${menuAuthorId}`).setLabel(ui.btn_phrases).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`cfg_menu_times_${menuAuthorId}`).setLabel(ui.btn_times).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`cfg_menu_sens_${menuAuthorId}`).setLabel(ui.btn_sens).setStyle(ButtonStyle.Primary)
    );
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cfg_menu_punish_${menuAuthorId}`).setLabel(ui.btn_punish).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`cfg_menu_lang_${menuAuthorId}`).setLabel(ui.btn_lang).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`cfg_menu_close_${menuAuthorId}`).setLabel(ui.btn_close).setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row1, row2] };
};

const bauePhrasesMenue = (sCfg, menuAuthorId) => {
    const ui = configTemplate.ui[sCfg.language];
    const embed = new EmbedBuilder()
        .setTitle(ui.phrases_title)
        .setDescription(ui.phrases_desc)
        .setColor(0x2ecc71);

    let nightText = sCfg.custom_phrases.night.map((s, idx) => `\`[${idx}]\` ${s}`).join('\n') || "None";
    let capsText = sCfg.custom_phrases.caps.map((s, idx) => `\`[${idx}]\` ${s}`).join('\n') || "None";

    embed.addFields(
        { name: "Night Phrases", value: nightText.substring(0, 1024) },
        { name: "Caps Phrases", value: capsText.substring(0, 1024) }
    );

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cfg_phr_add_night_${menuAuthorId}`).setLabel(ui.btn_add_night).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`cfg_phr_add_caps_${menuAuthorId}`).setLabel(ui.btn_add_caps).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`cfg_phr_rem_night_${menuAuthorId}`).setLabel(ui.btn_rem_night).setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`cfg_phr_rem_caps_${menuAuthorId}`).setLabel(ui.btn_rem_caps).setStyle(ButtonStyle.Danger)
    );
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cfg_back_${menuAuthorId}`).setLabel(ui.btn_back).setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row1, row2] };
};

const baueTimesMenue = (sCfg, menuAuthorId) => {
    const ui = configTemplate.ui[sCfg.language];
    const embed = new EmbedBuilder()
        .setTitle(ui.times_title)
        .setDescription(`Current Night Watch: \`${sCfg.night_start}:00\` to \`${sCfg.night_end}:00\``)
        .setColor(0x9b59b6);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cfg_time_change_${menuAuthorId}`).setLabel(ui.btn_change_times).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`cfg_back_${menuAuthorId}`).setLabel(ui.btn_back).setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row] };
};

const baueSensMenue = (sCfg, menuAuthorId) => {
    const ui = configTemplate.ui[sCfg.language];
    const embed = new EmbedBuilder()
        .setTitle(ui.sens_title)
        .setDescription(`Current Caps Trigger Percentage: \`${sCfg.caps_percentage}%\``)
        .setColor(0xe67e22);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cfg_sens_change_${menuAuthorId}`).setLabel(ui.btn_change_sens).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`cfg_back_${menuAuthorId}`).setLabel(ui.btn_back).setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row] };
};

const bauePunishMenue = (sCfg, menuAuthorId) => {
    const ui = configTemplate.ui[sCfg.language];
    const embed = new EmbedBuilder()
        .setTitle(ui.punish_title)
        .setColor(0xe74c3c)
        .addFields(
            { name: "Delete Caps Messages", value: sCfg.punishment_caps_delete ? "✅ Enabled" : "❌ Disabled" },
            { name: "Caps Timeout", value: sCfg.punishment_caps_timeout > 0 ? `⏳ ${sCfg.punishment_caps_timeout} min` : "❌ Disabled" },
            { name: "Night Timeout", value: sCfg.punishment_night_timeout > 0 ? `⏳ ${sCfg.punishment_night_timeout} min (after ${sCfg.punishment_night_trigger_count} messages)` : "❌ Disabled" }
        );

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cfg_pun_toggle_del_${menuAuthorId}`).setLabel(ui.btn_toggle_caps_del).setStyle(sCfg.punishment_caps_delete ? ButtonStyle.Success : ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`cfg_pun_modal_capsto_${menuAuthorId}`).setLabel(ui.btn_toggle_caps_to).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`cfg_pun_modal_nightto_${menuAuthorId}`).setLabel(ui.btn_toggle_night_to).setStyle(ButtonStyle.Primary)
    );
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cfg_back_${menuAuthorId}`).setLabel(ui.btn_back).setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [row1, row2] };
};

const baueLangMenue = (sCfg, menuAuthorId) => {
    const ui = configTemplate.ui[sCfg.language];
    const embed = new EmbedBuilder()
        .setTitle(ui.lang_title)
        .setDescription(`Current Language: \`${sCfg.language}\``)
        .setColor(0x34495e);

    const select = new StringSelectMenuBuilder()
        .setCustomId(`cfg_lang_select_${menuAuthorId}`)
        .setPlaceholder(ui.select_lang_placeholder)
        .addOptions(
            { label: 'English', value: 'en' },
            { label: 'Deutsch', value: 'de' },
            { label: 'Bayerisch', value: 'bar' }
        );

    const row1 = new ActionRowBuilder().addComponents(select);
    const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(cfg_back_${menuAuthorId}).setLabel(ui.btn_back).setStyle(ButtonStyle.Secondary));
    return { embeds: [embed], components: [row1, row2] };
};
client.once('ready', () => {
    console.log("Karl Heinz ready on discord.");
});
setInterval(() => {
    const jetzt = new Date();
    if (jetzt.getHours() === 6 && jetzt.getMinutes() === 0) {
        cacheNachtZaehler.clear();
        cacheHatSchonMecker.clear();
    }
}, 60000);
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const guildId = message.guild.id;
    const userId = message.author.id;
    const text = message.content;
    const sCfg = ladeServerConfig(guildId);
    const ui = configTemplate.ui[sCfg.language];
    if (text === '.config') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply(ui.no_perm);
        }
        const menueDaten = baueHauptmenue(sCfg, userId);
        return message.channel.send(menueDaten);
    }
    const jetztStunde = new Date().getHours();
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
        if (sCfg.punishment_night_timeout > 0 && neueAnzahl >= sCfg.punishment_night_trigger_count) {
            try {
                if (message.member && message.member.moderatable) {
                    await message.member.timeout(sCfg.punishment_night_timeout * 60 * 1000, "Nachtruhe missachtet");
                }
            } catch (e) {}
        }
    }
    const nurBuchstaben = text.replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
    if (nurBuchstaben.length >= 4) {
        let grossBuchstaben = 0;
        for (let i = 0; i < nurBuchstaben.length; i++) {
            if (nurBuchstaben[i] === nurBuchstaben[i].toUpperCase()) grossBuchstaben++;
        }
        const tatsaechlichProzent = (grossBuchstaben / nurBuchstaben.length) * 100;
        if (tatsaechlichProzent >= sCfg.caps_percentage) {
            if (sCfg.punishment_caps_delete) {
                try { 
                    await message.delete();
                } catch(e) {}
            }
            await message.channel.send(`<@${userId}>, ${gibSpruch(spruchListeCaps)}`);
            if (sCfg.punishment_caps_timeout > 0) {
                try {
                    if (message.member && message.member.moderatable) {
                        await message.member.timeout(sCfg.punishment_caps_timeout * 60 * 1000, "Zu viel Caps Lock");
                    }
                } catch (e) {}
            }
        }
    }
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.guildId) return;
    const guildId = interaction.guildId;
    let sCfg = ladeServerConfig(guildId);
    const ui = configTemplate.ui[sCfg.language];
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        const teile = interaction.customId.split('_');
        const menuAuthorId = teile[teile.length - 1];
        if (interaction.user.id !== menuAuthorId) {
            return interaction.reply({ content: ui.only_author, ephemeral: true });
        }
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: ui.no_perm, ephemeral: true });
        }
        if (interaction.customId.startsWith('cfg_menu_phrases_') || interaction.customId.startsWith('cfg_back_')) {
            return interaction.update(bauePhrasesMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('cfg_menu_times_')) {
            return interaction.update(baueTimesMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('cfg_menu_sens_')) {
            return interaction.update(baueSensMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('cfg_menu_punish_')) {
            return interaction.update(bauePunishMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('cfg_menu_lang_')) {
            return interaction.update(baueLangMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('cfg_menu_close_')) {
            return interaction.update({ content: ui.closed, embeds: [], components: [] });
        }
        if (interaction.customId.startsWith('cfg_pun_toggle_del_')) {
            sCfg.punishment_caps_delete = !sCfg.punishment_caps_delete;
            spechereServerConfig(guildId, sCfg);
            return interaction.update(bauePunishMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('cfg_lang_select_')) {
            sCfg.language = interaction.values[0];
            sCfg.custom_phrases.night = configTemplate.phrases[sCfg.language].night;
            sCfg.custom_phrases.caps = configTemplate.phrases[sCfg.language].caps;
            spechereServerConfig(guildId, sCfg);
            return interaction.update(baueHauptmenue(sCfg, menuAuthorId));
        }
        if (interaction.isButton() && interaction.customId.includes('modal')) {
            let modal;
            if (interaction.customId.startsWith('cfg_time_change_')) {
                modal = new ModalBuilder().setCustomId(mod_times_${menuAuthorId}).setTitle(ui.modal_times_title).addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('start').setLabel(ui.modal_start_lbl).setValue(String(sCfg.night_start)).setStyle(TextInputStyle.Short)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('end').setLabel(ui.modal_end_lbl).setValue(String(sCfg.night_end)).setStyle(TextInputStyle.Short)));
            } else if (interaction.customId.startsWith('cfg_sens_change_')) {
                modal = new ModalBuilder().setCustomId(mod_sens_${menuAuthorId}).setTitle(ui.modal_sens_title).addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('pct').setLabel(ui.modal_sens_lbl).setValue(String(sCfg.caps_percentage)).setStyle(TextInputStyle.Short)));
            } else if (interaction.customId.startsWith('cfg_phr_add_')) {
                const typ = interaction.customId.includes('night') ? 'night' : 'caps';
                modal = new ModalBuilder().setCustomId(mod_add_${typ}_${menuAuthorId}).setTitle(ui.modal_add_phr_title).addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('txt').setLabel(ui.modal_phr_lbl).setStyle(TextInputStyle.Paragraph)));
            } else if (interaction.customId.startsWith('cfg_phr_rem_')) {
                const typ = interaction.customId.includes('night') ? 'night' : 'caps';
                modal = new ModalBuilder().setCustomId(mod_rem_${typ}_${menuAuthorId}).setTitle(ui.modal_rem_phr_title).addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('idx').setLabel(ui.modal_rem_phr_lbl).setStyle(TextInputStyle.Short)));
            } else if (interaction.customId.startsWith('cfg_pun_modal_capsto_')) {
                modal = new ModalBuilder().setCustomId(mod_capsto_${menuAuthorId}).setTitle(ui.modal_to_title).addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('min').setLabel(ui.modal_to_lbl).setValue(String(sCfg.punishment_caps_timeout)).setStyle(TextInputStyle.Short)));
            } else if (interaction.customId.startsWith('cfg_pun_modal_nightto_')) {
                modal = new ModalBuilder().setCustomId(mod_nightto_${menuAuthorId}).setTitle(ui.modal_to_title).addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('min').setLabel(ui.modal_to_lbl).setValue(String(sCfg.punishment_night_timeout)).setStyle(TextInputStyle.Short)),new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('lim').setLabel(ui.modal_night_limit_lbl).setValue(String(sCfg.punishment_night_trigger_count)).setStyle(TextInputStyle.Short)));
            }
            if (modal) return interaction.showModal(modal);
        }
    }
    if (interaction.isModalSubmit()) {
        const teile = interaction.customId.split('_');
        const menuAuthorId = teile[teile.length - 1];
        if (interaction.customId.startsWith('mod_times_')) {
            const start = parseInt(interaction.fields.getTextInputValue('start'));
            const end = parseInt(interaction.fields.getTextInputValue('end'));
            if (!isNaN(start) && start >= 0 && start <= 23) sCfg.night_start = start;
            if (!isNaN(end) && end >= 0 && end <= 23) sCfg.night_end = end;
            spechereServerConfig(guildId, sCfg);
            return interaction.update(baueTimesMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('mod_sens_')) {
            const pct = parseInt(interaction.fields.getTextInputValue('pct'));
            if (!isNaN(pct) && pct >= 1 && pct <= 100) sCfg.caps_percentage = pct;
            spechereServerConfig(guildId, sCfg);
            return interaction.update(baueSensMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('mod_add_')) {
            const typ = teile[2];
            const txt = interaction.fields.getTextInputValue('txt');
            if (txt) sCfg.custom_phrases[typ].push(txt);spechereServerConfig(guildId, sCfg);
            return interaction.update(bauePhrasesMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('mod_rem_')) {
            const typ = teile[2];
            const idx = parseInt(interaction.fields.getTextInputValue('idx'));
            if (!isNaN(idx) && idx >= 0 && idx < sCfg.custom_phrases[typ].length) {
                sCfg.custom_phrases[typ].splice(idx, 1);
            }
            spechereServerConfig(guildId, sCfg);
            return interaction.update(bauePhrasesMenue(sCfg, menuAuthorId));
        }
        if (interaction.customId.startsWith('mod_capsto_')) {
            const min = parseInt(interaction.fields.getTextInputValue('min'));
            if (!isNaN(min) && min >= 0) sCfg.punishment_caps_timeout = min;
            spechereServerConfig(guildId, sCfg);
            return interaction.update(bauePunishMenue(sCfg, menuAuthorId));
        }if (interaction.customId.startsWith('mod_nightto_')) {
            const min = parseInt(interaction.fields.getTextInputValue('min'));
            const lim = parseInt(interaction.fields.getTextInputValue('lim'));
            if (!isNaN(min) && min >= 0) sCfg.punishment_night_timeout = min;
            if (!isNaN(lim) && lim >= 1) sCfg.punishment_night_trigger_count = lim;
            spechereServerConfig(guildId, sCfg);
            return interaction.update(bauePunishMenue(sCfg, menuAuthorId));
        }
    }
});
client.login(process.env.BOT_TOKEN);
