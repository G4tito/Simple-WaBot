const youtube = require('../../lib/scraper/youtube.js');
const { formatSize } = require('../../lib/func.js');
const ufs = require('../../lib/ufs.js');

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
            + '\t' + '◦  *Título* : ' + result.title + '\n'
            + '\t' + '◦  *ID* : ' + result.videoId + '\n'
            + '\t' + '◦  *Canal* : ' + result.author.name + '\n'
            + '\t' + '◦  *Subido* : ' + toTimeAgo(result.ago) + '\n'
            + '\t' + '◦  *Vistas* : ' + (toCompact(result.views) || result.views) + '\n'
            + '\t' + '◦  *Duración* : ' + result.timestamp + '\n'
            + '\t' + '◦  *URL* : ' + URL + '\n\n'
            + '*Para descargar*, responde con `Audio` o `Video`.';

        await msg.reply(teks, { image: result.thumbnail });
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


const audioLimit = 20 * 1024 * 1024; // 20 MB
const videoLimit = 70 * 1024 * 1024; // 70 MB

exports.before = {
    async start({ msg, isBaileys }) {
        if (isBaileys) return;

        const type = (msg?.text || '').toLowerCase();
        if (type !== 'audio' && type !== 'video') {
            return;
        }

        if (!msg.quoted) {
            return msg.reply('*🚩 Etiqueta el mensaje que contenga el resultado de YouTube Play.*');
        }

        if (!msg.quoted.text.includes('—  *YOUTUBE*  〤  *PLAY*')) {
            return msg.reply('*🚩 Ese mensaje no contiene el resultado de YouTube Play.*');
        }

        const urls = msg.quoted.text.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed|shorts)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\_-]+)/gi);

        await msg.react('🕓');

        const mediaType = type === 'audio' ? 'audio' : 'video';
        const result = await getMedia(urls[0], mediaType);

        if (!result) {
            await msg.react('✖');
            return msg.reply('*📛 | Ups, hubo un error al obtener el resultado.*');
        }

        const urlToUse = mediaType === 'audio' ? result.audio.url || result.audio.buffer : result.video.url;
        const sizeInBytes = await ufs(urlToUse);

        const limit = mediaType === 'audio' ? audioLimit : videoLimit;

        if (sizeInBytes >= limit) {
            const readableSize = await formatSize(sizeInBytes);
            const limitReadable = await formatSize(limit);
            await msg.react('✖');
            return msg.reply(`*📂 | El archivo pesa ${readableSize}, excede el límite máximo de descarga que es de ${limitReadable}.*`);
        }

        const fileExtension = mediaType === 'audio' ? '.mp3' : '.mp4';
        const mimetype = mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4';

        await msg.reply(result.title, { [mediaType]: urlToUse, fileName: result.title + fileExtension, mimetype });
        await msg.react('✅');
    }
};

async function getMedia(url, type) {
    for (const version of ['V1', 'V2']) {
        const { status, result } = await youtube.download[version](url, { type, quality: type === 'audio' ? 128 : 360 });
        if (status) {
            return result;
        }
    }
    return null;
}