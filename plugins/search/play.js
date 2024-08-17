const { prepareWAMessageMedia, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const youtube = require('../../lib/scraper/youtube.js');

exports.cmd = {
    name: ['play'],
    command: ['play'],
    category: ['search'],
    detail: {
        desc: 'Realiza una búsqueda en YouTube.',
        use: 'text'
    },
    setting: {
        error_react: true
    },
    async start({ msg, sock, text, prefix, command }) {
        if (!text) {
            return msg.reply(`*🚩 Ingresa el título de un video para hacer una búsqueda en YouTube.*`);
        }

        await msg.react('🕓');
        let { status, result } = await youtube.play(text);
        if (!status) {
            await msg.reply('*📛 | No hay resultados disponibles que coincidan con su búsqueda.*');
            return msg.react('✖');
        }

        let URL = 'https://youtu.be/' + result.videoId;
        let teks = '—  *YOUTUBE*  〤  *PLAY*' + '\n\n'
            + '- *Título* · ' + result.title + '\n'
            + '- *ID* · ' + result.videoId + '\n'
            + '- *Canal* · ' + result.author.name + '\n'
            + '- *Subido* · ' + toTimeAgo(result.ago) + '\n'
            + '- *Vistas* · ' + (toCompact(result.views) || result.views) + '\n'
            + '- *Duración* · ' + result.timestamp + '\n'
            + '- *URL* · ' + URL + '\n';

        let prepareMessage = await prepareWAMessageMedia({ image: { url: result.thumbnail }}, { upload: sock.waUploadToServer });
        let message = generateWAMessageFromContent(msg.from, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        contextInfo: {
                            expiration: msg.expiration
                        },
                        body: { text: teks },
                        footer: { text: 'Selecciona un *formato* de descarga *mp3* o *mp4*.' },
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: prepareMessage.imageMessage,
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Audio 🎵',
                                        id: prefix + 'ytmp3 ' + URL
                                    })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Video 🎥',
                                        id: prefix + 'ytmp4 ' + URL
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

        //await msg.reply(teks, { image: result.thumbnail });
        await msg.react('✅');
    }
};


function toCompact(num) {
    return new Intl.NumberFormat('en-GB', { 
        notation: 'compact', 
        compactDisplay: 'short' 
    }).format(num);
}

function toTimeAgo(ago) {
    if (typeof ago !== 'string') return '–';
    let timeFormats = [
        { unit: 'minute', s: 'minuto', p: 'minutos' },
        { unit: 'hour', s: 'hora', p: 'horas' },
        { unit: 'day', s: 'día', p: 'días' },
        { unit: 'week', s: 'semana', p: 'semanas' },
        { unit: 'month', s: 'mes', p: 'meses' },
        { unit: 'year', s: 'año', p: 'años' }
    ];

    for (let format of timeFormats) {
        if (ago.includes(format.unit)) {
            let value = parseInt(ago);
            if (isNaN(value)) return ago;
            let timeAgoString = value === 1 ? format.s : format.p;
            return 'hace ' + value + ' ' + timeAgoString;
        }
    }
    
    return ago;
}
