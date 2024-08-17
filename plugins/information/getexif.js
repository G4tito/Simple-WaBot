const { Image } = require('node-webpmux');

exports.cmd = {
    name: ['getexif'],
    command: ['getexif', 'getmeta'],
    category: ['information'],
    detail: {
        desc: 'Extrae la metadata de un sticker.',
        use: 'media'
    },
    async start({ msg }) {
        const q = msg.quoted ? msg.quoted : msg;
        
        if (!/sticker/.test(q.type)) {
            return msg.reply('Etiqueta un sticker para extraer la metadata.');
        }

        const img = new Image();
        await img.load(await q.download());
        const exif = JSON.parse(img.exif.slice(22).toString());

        let teks = '—  *STICKER*  〤  *EXIF*' + '\n\n'
            + `- *Nombre* ∙ ${exif['sticker-pack-name'] || '–'}\n`
            + `- *Author* ∙ ${exif['sticker-pack-publisher'] || '–'}\n`
            + `- *ID* ∙ ${exif['sticker-pack-id'] || '–'}\n\n`
            + `- *Android Store* ∙ ${exif['android-app-store-link'] || '–'}\n`
            + `- *iOS Store* ∙ ${exif['ios-app-store-link'] || '–'}\n\n`
            + `- *Emojis* ∙ ${Array.isArray(exif.emojis) ? exif.emojis.join(', ') : exif?.emojis?.length ? exif.emojis : '–'}\n`;

        const otherKeys = Object.keys(exif).filter(key =>
            !['sticker-pack-name', 'sticker-pack-publisher', 'sticker-pack-id', 'android-app-store-link', 'ios-app-store-link', 'emojis'].includes(key)
        );

        if (otherKeys.length > 0) {
            teks += '\n  *🍟 Others* ;\n\n' + otherKeys.map(key => {
                const formattedKey = key.replace('sticker-pack-', '')
                    .replace(/-/g, ' ')
                    .replace(/^\w/, c => c.toUpperCase());
                const value = typeof exif[key] === 'object' ? JSON.stringify(exif[key]) : exif[key];
                return `- *${formattedKey}* ∙ ${value}`;
            }).join('\n');
        }

        await msg.reply(teks);
    }
};