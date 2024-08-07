const fetch = require('node-fetch');
const { format } = require('util');

exports.cmd = {
    name: ['fetch'],
    command: ['fetch'],
    category: ['information'],
    detail: {
        desc: 'Extrae el contenido de una página web.',
        use: '@url'
    },
    async start({ msg, text }) {
        if (!isURL(text)) {
            return msg.reply('Proporcione una URL válida.');
        }

        const url = new URL(text).href;
        const res = await fetch(url);

        const contentLength = res.headers.get('content-length');
        if (contentLength > 50 * 1024 * 1024) {
            return msg.reply(`Content-Length: ${contentLength}`);
        }

        const contentType = res.headers.get('content-type');
        if (!/text|json/.test(contentType)) {
            return msg.reply(url, { media: url });
        }

        let teks = await res.buffer();
        try {
            teks = format(JSON.parse(teks.toString()));
        } catch (e) {
            teks = teks.toString();
        }

        await msg.reply(teks.slice(0, 65536));
    }
};


function isURL(q) {
    return /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i.test(q);
}
