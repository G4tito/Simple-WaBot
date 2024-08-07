const youtube = require('../../lib/scraper/youtube.js');

exports.cmd = {
    name: ['ytsearch'],
    command: ['ytsearch', 'yts'],
    category: ['search'],
    detail: {
        desc: 'Realiza una búsqueda en YouTube.',
        use: '@text'
    },
    setting: {
        error_react: true
    },
    async start({ msg, text, prefix, command }) {
        if (!text) {
            return msg.reply(`*🚩 Ingresa el título de un video para hacer una búsqueda en YouTube.*`);
        }
        
        await msg.react('🕓');
        let { status, result } = await youtube.search(text);
        if (!status) {
            await msg.reply('*📛 | No hay resultados disponibles que coincidan con su búsqueda.*');
            return msg.react('✖');
        }
        
        let teks = '—  *YOUTUBE*  〤  *SEARCH*' + '\n';
        for (let i = 0; i < Math.min(15, result.length); i++) {
            teks += '\n'
                + '- *Nro* · `' + (i + 1) + '`\n'
                + '- *Titulo* · ' + result[i].title + '\n'
                + '- *ID* · ' + result[i].videoId + '\n'
                + '- *Canal* · ' + result[i].author.name + '\n'
                + '- *Subido* · ' + toTimeAgo(result[i].ago) + '\n'
                + '- *Vistas* · ' + (toCompact(result[i].views) || result[i].views) + '\n'
                + '- *Duración* · ' + result[i].timestamp + '\n'
                + '- *Url* · ' + 'https://youtu.be/' + result[i].videoId + '\n';
        }

        await msg.reply(teks, { image: result[0].thumbnail });
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
