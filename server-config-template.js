module.exports = {
    language: "en",
    night_start: 22,
    night_end: 6,
    caps_percentage: 70,
    punishment_caps_timeout: 0,
    punishment_caps_delete: false,
    punishment_night_timeout: 0,
    punishment_night_trigger_count: 5,
    phrases: {
        de: {
            night: [
                "Es ist nach 22 Uhr! Schleichts euch ins Bett!",
                "Ab ins Körbchen, es ist Nachtruhe!",
                "Wer jetzt noch schreibt, kriegt eine mit'm Pantoffel!",
                "Ruhe im Karton hier, Karl Heinz will schlafen!",
                "Hush jetzt, die Nachtwache duldet kein Geplapper!"
            ],
            caps: [
                "Schrei mi ned so o! Mach die Feststelltaste aus!",
                "Warum brüllst du so? Ich bin nicht taub!",
                "Brüll woanders rum, Kollege!",
                "Tastatur kaputt oder warum schreibst du so groß?!",
                "Leiser schreiben, bitte!"
            ]
        },
        en: {
            night: [
                "It's past 10 PM! Go to sleep!",
                "Bedtime! Keep it quiet!",
                "Quiet down, Karl Heinz is trying to sleep!",
                "Night mode is active, shhh!",
                "No talking during quiet hours!"
            ],
            caps: [
                "Stop yelling! Turn off Caps Lock!",
                "Why are you shouting? I'm not deaf!",
                "Calm down with the capital letters!",
                "Is your keyboard broken?",
                "Keep your voice down here!"
            ]
        },
        bar: {
            night: [
                "Es is nacha zehne! Ab ins Bett etzat!",
                "Schleichs eich in d'Heia, Nachtruah is!",
                "Wer iazt no plärrt, kriagt a Watschn!",
                "Ruahgstellt werd, da Karl Heinz mog pennen!",
                "Gschpariats eich d'Sprüch für moagn auf!"
            ],
            caps: [
                "Plärr ned so dumm rum da!",
                "I bin ned daub, mach d'Feststelltastn aus!",
                "Wieso schraist'n so, herst?",
                "Tastatua hi oda wos is los?",
                "Ganz gschmeidig bleibm, ned so rumbrüin!"
            ]
        }
    },
    ui: {
        en: {
            main_title: "Karl Heinz Config Menu",
            main_desc: "Manage settings for this server.",
            btn_phrases: "Phrases", btn_times: "Times", btn_sens: "Sensitivity", btn_punish: "Punishments", btn_lang: "Languages", btn_close: "Close", btn_back: "Back",
            phrases_title: "Phrases Menu", phrases_desc: "Add or remove phrases for night watch and caps control.",
            btn_add_night: "Add Night Phrase", btn_add_caps: "Add Caps Phrase", btn_rem_night: "Remove Night Phrase", btn_rem_caps: "Remove Caps Phrase",
            times_title: "Times Menu", btn_change_times: "Change Times",
            sens_title: "Sensitivity Menu", btn_change_sens: "Change Sensitivity",
            punish_title: "Punishments Menu", btn_toggle_caps_del: "Toggle Caps Delete", btn_toggle_night_to: "Night Timeout", btn_toggle_caps_to: "Caps Timeout",
            lang_title: "Language Menu", select_lang_placeholder: "Choose a language...",
            closed: "Menu closed.", no_perm: "You do not have Administrator permissions to use this.", only_author: "This menu belongs to someone else.",
            modal_times_title: "Change Night Times", modal_start_lbl: "Start Hour (0-23)", modal_end_lbl: "End Hour (0-23)",
            modal_sens_title: "Change Caps Sensitivity", modal_sens_lbl: "Caps Percentage (1-100)",
            modal_add_phr_title: "Add Phrase", modal_phr_lbl: "Enter Phrase Text",
            modal_rem_phr_title: "Remove Phrase", modal_rem_phr_lbl: "Enter Index Number to Delete",
            modal_to_title: "Timeout Duration", modal_to_lbl: "Minutes (0 to disable)", modal_night_limit_lbl: "Allowed messages before timeout"
        },
        de: {
            main_title: "Karl Heinz Konfigurationsmenü",
            main_desc: "Verwende die Buttons, um den Bot anzupassen.",
            btn_phrases: "Sätze", btn_times: "Zeiten", btn_sens: "Empfindlichkeit", btn_punish: "Strafen", btn_lang: "Sprachen", btn_close: "Schließen", btn_back: "Zurück",
            phrases_title: "Sätze-Menü", phrases_desc: "Eigene Sprüche hinzufügen oder entfernen.",
            btn_add_night: "Nacht-Spruch +", btn_add_caps: "Caps-Spruch +", btn_rem_night: "Nacht-Spruch -", btn_rem_caps: "Caps-Spruch -",
            times_title: "Zeiten-Menü", btn_change_times: "Zeiten ändern",
            sens_title: "Empfindlichkeits-Menü", btn_change_sens: "Wert ändern",
            punish_title: "Strafen-Menü", btn_toggle_caps_del: "Caps Nachricht löschen", btn_toggle_night_to: "Nacht Timeout", btn_toggle_caps_to: "Caps Timeout",
            lang_title: "Sprachen-Menü", select_lang_placeholder: "Sprache auswählen...",
            closed: "Menü geschlossen.", no_perm: "Du hast keine Administrator-Rechte für diesen Befehl.", only_author: "Dieses Menü gehört einem anderen Admin.",
            modal_times_title: "Nachtzeiten ändern", modal_start_lbl: "Startstunde (0-23)", modal_end_lbl: "Endstunde (0-23)",
            modal_sens_title: "Caps-Empfindlichkeit ändern", modal_sens_lbl: "Großbuchstaben-Prozent (1-100)",
            modal_add_phr_title: "Spruch hinzufügen", modal_phr_lbl: "Spruchtext eingeben",
            modal_rem_phr_title: "Spruch löschen", modal_rem_phr_lbl: "Nummer des Spruchs zum Löschen",
            modal_to_title: "Timeout Dauer", modal_to_lbl: "Minuten (0 zum Deaktivieren)", modal_night_limit_lbl: "Erlaubte Nachrichten vor Strafe"
        },
        bar: {
            main_title: "Karl Heinz sei Einstellungs-Menü",
            main_desc: "Klicke auf d'Buttons rum zum Einstellen.",
            btn_phrases: "Sprüch", btn_times: "Zeiten", btn_sens: "Empfindlichkeit", btn_punish: "Strafn", btn_lang: "Sprachn", btn_close: "Schliaßn", btn_back: "Z'ruck",
            phrases_title: "Sprüch-Menü", phrases_desc: "Eigne Textln neischreiben oder naushauen.",
            btn_add_night: "Nacht-Spruch +", btn_add_caps: "Caps-Spruch +", btn_rem_night: "Nacht-Spruch -", btn_rem_caps: "Caps-Spruch -",
            times_title: "Zeiten-Menü", btn_change_times: "Zeiten ändern",
            sens_title: "Empfindlichkeits-Menü", btn_change_sens: "Wert ändern",
            punish_title: "Strafn-Menü", btn_toggle_caps_del: "Caps Löschen Umschalten", btn_toggle_night_to: "Nacht Timeout", btn_toggle_caps_to: "Caps Timeout",
            lang_title: "Sprachn-Menü", select_lang_placeholder: "Sprach aussuacha...",
            closed: "Menü gschlossn.", no_perm: "Du bist koa Admin, schleich di.", only_author: "Des Menü gheat am andan Admin.",
            modal_times_title: "Nachtzeitn ändern", modal_start_lbl: "Anfangsstund (0-23)", modal_end_lbl: "Endstund (0-23)",
            modal_sens_title: "Caps-Wert ändern", modal_sens_lbl: "Prozent (1-100)",
            modal_add_phr_title: "Spruch neischreiben", modal_phr_lbl: "Text eingebn",
            modal_rem_phr_title: "Spruch naushauen", modal_rem_phr_lbl: "Nummer eingebn zum Löschen",
            modal_to_title: "Timeout Zeit", modal_to_lbl: "Minutn (0 für aus)", modal_night_limit_lbl: "Erlaubte Posts vor Strafe"
        }
    }
};
