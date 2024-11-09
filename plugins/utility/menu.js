const { formatTime, resizeImage } = require('../../lib/func.js');
const { timeZone } = require('../../setting.js');
const db = require('../../lib/database.js');
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');

const categories = [
    {
        category: ['utility'],
        emoji: '🔰',
        name: 'Utilidad'
    },
    {
        category: ['search'],
        emoji: '🔍',
        name: 'Búsqueda'
    },
    {
        category: ['convert'],
        emoji: '🪄',
        name: 'Convertidor'
    },
    {
        category: ['download'],
        emoji: '📥',
        name: 'Descargas'
    },
    {
        category: ['economy'],
        emoji: '🪙',
        name: 'Economía'
    },
    {
        category: ['images'],
        emoji: '🧧',
        name: 'Imágenes'
    },
    {
        category: ['fun'],
        emoji: '🪅',
        name: 'Diversión'
    },
    {
        category: ['moderation'],
        emoji: '🛡️',
        name: 'Moderación'
    },
    {
        category: ['other'],
        emoji: '🧩',
        name: 'Otros'
    }
];

exports.cmd = {
    name: ['menu'],
    command: ['menu', 'commands', 'help'],
    category: ['utility'],
    detail: {
        desc: 'Muestra una lista de todos los comandos disponibles.',
    },
    async start({ msg, args, sock, command, prefix, db, plugins }) {
        const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '../../', 'package.json'), 'utf8'));
        const category = args[0] ? args[0].toLowerCase() : '';
        let teks = 'Sistema automatizado (*WhatsApp Bot*) que te ayuda a realizar diversas tareas directamente a través de *@0*. 🪶\n\n'
                + '\t◦  *Fecha* · ' + formatTime('date') + '\n'
                + '\t◦  *Hora* · ' + formatTime('hour') + '\n';

        if (category === 'all') {
            categories.forEach(cat => {
                teks += `\n\t\t*${cat.name.toUpperCase()}*\n`;

                const filteredCommands = plugins.commands.map(c => Object.values(c)[0]).filter(cmd => (cmd.category || []).includes(cat.category[0]));
                filteredCommands.forEach((cmd, index) => {
                    teks += `- ✗⃝${cat.emoji}  ${prefix + cmd.name[0]}${cmd.detail?.use ? ` < *${cmd.detail.use}* >` : ''}${cmd.setting?.isNsfw ? `  (*+18*)` : ''}\n`;
                });
            });
        } else if (categories.some(cat => cat.category.includes(category))) {
            const selectedCategory = categories.find(cat => cat.category.includes(category));
            teks = `*Categoría ${selectedCategory.name}* ${selectedCategory.emoji} ;\n\n`;

            const filteredCommands = plugins.commands.map(c => Object.values(c)[0]).filter(cmd => (cmd.category || []).includes(category));
            filteredCommands.forEach((cmd, index) => {
                const isFirst = index === 0;
                const isLast = index === filteredCommands.length - 1;

                if (isFirst) {
                    teks += `\t┌ ◦  ${prefix + cmd.name[0]}${cmd.detail?.use ? ` < *${cmd.detail.use}* >` : ''}${cmd.setting?.isNsfw ? `  (*+18*)` : ''}\n`;
                } else if (isLast) {
                    teks += `\t└ ◦  ${prefix + cmd.name[0]}${cmd.detail?.use ? ` < *${cmd.detail.use}* >` : ''}${cmd.setting?.isNsfw ? `  (*+18*)` : ''}\n`;
                } else {
                    teks += `\t│ ◦  ${prefix + cmd.name[0]}${cmd.detail?.use ? ` < *${cmd.detail.use}* >` : ''}${cmd.setting?.isNsfw ? `  (*+18*)` : ''}\n`;
                }
            });

            return msg.reply(teks);
        } else {
            teks += '\n  📒 *Categorías* ;\n\n';
            categories.forEach(cat => {
                teks += `- ${cat.emoji}  ${cat.name}  (${cat.category[0]})\n`;
            });

            teks += `\n  🍟 *Ejem. de Uso* ;\n\n1. ${prefix + command} < category >\n2. ${prefix + command} utility\n\nPara ver todos los comandos, usa: \`${prefix + command} all\`\n`;
        }

        const setting = db.settings.get(sock.user.jid);
        const cover = setting.cover === '' ? global.img.cover : setting.cover;

        await msg.reply({
            document: true,
            fileName: 'Official WaBot  (猫)',
            jpegThumbnail: await resizeImage(cover, 450),
            mimetype: 'application/vnd.ms-excel',
            fileLength: 1e14,
            caption: teks,
            mentions: ['0@s.whatsapp.net']
        })
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
