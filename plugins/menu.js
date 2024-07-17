const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { getTime, resizeImage } = require('../lib/func.js');
const { timeZone } = require('../setting.js');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');

const tags = {
    'search': {
        emoji: '🔎',
        name: 'Búsqueda'
    },
    'download': {
        emoji: '📥',
        name: 'Descargas'
    },
    'advanced': {
        emoji: '🧠',
        name: 'Avanzado'
    },
};

exports.cmd = {
    name: ['menu'],
    command: ['menu', 'commands', 'help'],
    category: ['main'],
    detail: {
        desc: 'Muestra todas las funciones disponibles.',
    },
    async start({ msg, sock, prefix, db, plugins }) {
        const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '../', 'package.json'), 'utf8'));
            let teks = 'Este es un bot *multifuncional* para WhatsApp, con funcionalidades *simples* que se *ampliarán* gradualmente. 🪶' + '\n\n'
                + '\t• *Índice* 🗞' + '\n'
                + '\t\t◦  *@text*: Ingresa un texto.' + '\n'
                + '\t\t◦  *@url*: Ingresa un enlace.' + '\n\n'

        for (const tag in tags) {
            teks += `\t• *${tags[tag].name}*\n`;

            let nro = 0;
            const filteredCommands = plugins.commands.map(c => Object.values(c)[0]).filter(cmd => (cmd.category || []).includes(tag));
            for (const [index, cmd] of filteredCommands.entries()) {
                nro += 1;
                const isFirst = nro === 1;
                const isLast = nro === filteredCommands.length;

                teks += `\t${isFirst ? '┌' : '│'} ${prefix + cmd.name[0]}${cmd.detail?.use ? ` *${cmd.detail.use}*` : ''}${isLast ? '└' : '│'}\n`;
            }
        }

        let documentMessage = {
            url: 'https://mmg.whatsapp.net/v/t62.7119-24/32511132_500473132560305_5925723291063172577_n.enc?ccb=11-4&oh=01_Q5AaIKnXNmUWgmxyNn_1uxfEnGyiI-eCZ-BMRZdX3O2jhQq2&oe=66BE7A32&_nc_sid=5e03e0&mms3=true',
            mimetype: 'application/vnd.ms-excel',
            fileSha256: 'FikZgFEcHv5jpyU1PhL10sPCmtsmcqnWUKaxot10tUU=',
            fileLength: 1e14,
            mediaKey: 'RZ3iF3NexfIjD1MB9EfJhMo/xcBZnbEZ/gVSuxlrHWE=',
            fileName: 'Official WaBot 猫',
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
    const greetings = ['Buenas noches 🎑', 'Buen día 🌄', 'Buenas tardes 🌇'];
    const index = Math.floor((time % 24) / 8);
    return greetings[index] || '';
}
