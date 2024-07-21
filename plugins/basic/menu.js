const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { getTime, resizeImage } = require('../../lib/func.js');
const { timeZone } = require('../../setting.js');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');

const tags = {
    'basic': {
        emoji: '📚',
        name: 'Básicos'
    },
    'moderation': {
        emoji: '⚖',
        name: 'Moderación'
    },
    'anime': {
        emoji: '🧧',
        name: 'Anime'
    },
    'convert': {
        emoji: '🧩',
        name: 'Convertidor'
    },
    'search': {
        emoji: '🔎',
        name: 'Búsqueda'
    },
    'download': {
        emoji: '📥',
        name: 'Descargas'
    },
    'script': {
        emoji: '👾',
        name: 'Script'
    },
    'advanced': {
        emoji: '🧠',
        name: 'Avanzado'
    }
};

exports.cmd = {
    name: ['menu'],
    command: ['menu', 'commands', 'help'],
    category: ['basic'],
    detail: {
        desc: 'Muestra una lista de todos los comandos disponibles.',
    },
    async start({ msg, sock, prefix, db, plugins }) {
        const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '../../', 'package.json'), 'utf8'));
            let teks = 'Este es un bot *multifuncional* para WhatsApp, con funcionalidades *simples* que se *ampliarán* gradualmente. 🪶' + '\n\n'
                + '\t• *Índice* 🗞' + '\n'
                + '\t\t◦  *@text*: Ingresa un texto.' + '\n'
                + '\t\t◦  *@quoted*: Responde a un mensaje.' + '\n'
                + '\t\t◦  *@url*: Ingresa un enlace.' + '\n'
                + '\t\t◦  *@user*: Etiqueta a un usuario.' + '\n'

        for (const tag in tags) {
            teks += `\n\t• ${tags[tag].emoji} › *${tags[tag].name}*\n`;

            const filteredCommands = plugins.commands.map(c => Object.values(c)[0]).filter(cmd => (cmd.category || []).includes(tag));
            filteredCommands.forEach((cmd, index) => {
                const isFirst = index === 0;
                const isLast = index === filteredCommands.length - 1;

                if (isFirst) {
                    teks += `\t┌ ${prefix + cmd.name[0]}${cmd.detail?.use ? ` *${cmd.detail.use}*` : ''}\n`;
                } else if (isLast) {
                    teks += `\t└ ${prefix + cmd.name[0]}${cmd.detail?.use ? ` *${cmd.detail.use}*` : ''}\n`;
                } else {
                    teks += `\t├ ${prefix + cmd.name[0]}${cmd.detail?.use ? ` *${cmd.detail.use}*` : ''}\n`;
                }
            });
        }

        let documentMessage = {
            url: 'https://mmg.whatsapp.net/v/t62.7119-24/32511132_500473132560305_5925723291063172577_n.enc?ccb=11-4&oh=01_Q5AaIKnXNmUWgmxyNn_1uxfEnGyiI-eCZ-BMRZdX3O2jhQq2&oe=66BE7A32&_nc_sid=5e03e0&mms3=true',
            mimetype: 'application/vnd.ms-excel',
            fileSha256: 'FikZgFEcHv5jpyU1PhL10sPCmtsmcqnWUKaxot10tUU=',
            fileLength: 1e14,
            mediaKey: 'RZ3iF3NexfIjD1MB9EfJhMo/xcBZnbEZ/gVSuxlrHWE=',
            fileName: 'Official WaBot  (猫)',
            fileEncSha256: 'K+Bkh4AGLJTffSvs63DuMZumwquU014W8XsaWvfakPM=',
            directPath: '/v/t62.7119-24/32511132_500473132560305_5925723291063172577_n.enc?ccb=11-4&oh=01_Q5AaIKnXNmUWgmxyNn_1uxfEnGyiI-eCZ-BMRZdX3O2jhQq2&oe=66BE7A32&_nc_sid=5e03e0',
        };

        let message = generateWAMessageFromContent(msg.from, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        contextInfo: {
                            expiration: msg.expiration,
                            externalAdReply: {
                                mediaType: 1,
                                previewType: 0,
                                renderLargerThumbnail: true,
                                thumbnail: await resizeImage(global.img.cover, 500),
                                thumbnailUrl: msg.id,
                                title: `Hola ! «@${msg.pushName}» 👋🏻`,
                                body: greeting()
                            }
                        },
                        body: { text: teks },
                        footer: { text: '© Simple WhatsApp Bot | v' + version },
                        header: {
                            hasMediaAttachment: true,
                            documentMessage,
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Github 🍟',
                                        url: 'https://github.com/G4tito/Simple-WaBot',
                                        merchant_url: 'https://github.com/G4tito/Simple-WaBot'
                                    })
                                }
                            ],
                            messageParamsJson: '',
                        },
                    },
                },
            }
        }, { userJid: sock.user.jid, quoted: msg });

        await sock.relayMessage(msg.from, message.message, {});
    }
};

function greeting() {
    const time = moment().tz(timeZone).hour();
    const greetings = {
        midnight: 'Buenas medianoche 🌌',
        morning: 'Buen día 🌄',
        noon: 'Buen mediodía 🌤',
        afternoon: 'Buenas tardes 🌇',
        night: 'Buenas noches 🎑'
    };

    if (time === 0) {
        return greetings.midnight;
    } else if (time >= 6 && time < 12) {
        return greetings.morning;
    } else if (time === 12) {
        return greetings.noon;
    } else if (time >= 13 && time < 19) {
        return greetings.afternoon;
    } else {
        return greetings.night;
    }
}
