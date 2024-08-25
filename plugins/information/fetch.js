const fetch = require('node-fetch');
const { format } = require('util');

exports.cmd = {
    name: ['fetch'],
    command: ['fetch'],
    category: ['information'],
    detail: {
        desc: 'Extrae el contenido de una página web.',
        use: 'url'
    },
    async start({ msg, text }) {
        if (!text) {
            return msg.reply('*🚩 Ingresa la URL de página web a la que deseas extraer el contenido.*');
        }

        if (!isValidURL(text)) {
            return msg.reply('*🚩 Proporcione una URL válida.*');
        }

        const url = new URL(text).href;
        const response = await fetch(url);

        const contentLength = response.headers.get('content-length');
        if (contentLength > 50 * 1024 * 1024) {
            return msg.reply(`Content-Length: ${contentLength}`);
        }

        const contentType = response.headers.get('content-type');
        if (!/text|json/.test(contentType)) {
            return msg.reply(url, { media: url });
        }

        let content = await response.buffer();
        try {
            content = format(JSON.parse(content.toString()));
        } catch (e) {
            content = content.toString();
        }

        await msg.reply(content.slice(0, 65536));
    }
};

function isValidURL(query) {
    return /^https:\/\/[^\s/$.?#].[^\s]*$/i.test(query);
}