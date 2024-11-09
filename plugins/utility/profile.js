const { formatTime } = require('../../lib/func.js');
const { owner } = require('../../setting.js');
const PhoneNumber = require('awesome-phonenumber');

exports.cmd = {
    name: ['profile'],
    command: ['profile'],
    category: ['utility'],
    detail: {
        desc: 'Muestra tu perfil o el de otro usuario.',
        use: 'user'
    },
    async start({ msg, prefix, sock, db }) {
        let who = msg.quoted 
            ? msg.quoted.sender 
            : (msg.mentions && msg.mentions[0]) 
                ? msg.mentions[0] 
                : msg.fromMe 
                    ? sock.user.jid 
                    : msg.sender;

        let pp = await sock.profilePictureUrl(who, 'image').catch(() => global.img.avatar);
        let phone = PhoneNumber('+' + who.replace('@s.whatsapp.net', ''));
        let about = (await sock.fetchStatus(who).catch(() => {}))?.status || '–';
        let user = db.users.get(who);
        
        let userType = [...owner.map(([number]) => number)]
            .map(v => v?.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
            .includes(who) ? 'Owner (🐈)' 
            : who === sock.user.jid ? 'Bot (🤖)' 
            : user?.premium?.status ? 'Premium (👑)' 
            : 'User (👤)';

        let teks = '—  *PROFILE*  〤  *USER*' + '\n\n'
            + '- *Tag* ∙ @' + who.replace(/@.+/, '') + '\n'
            + '- *About* ∙ ' + about + '\n'
            + '- *Nro* ∙ ' + phone.getNumber('international') + '\n'
            + '- *Api* ∙ Wa.me/' + who.split('@')[0] + '\n\n'
            + '- *Tipo* ∙ ' + userType + '\n\n';

        if (db.users.exist(who)) {
            teks += '  🍟 *Reg. Info* ;' + '\n\n'
                + '- *User* ∙ ' + user.name + '\n'
                + '- *ID* ∙ \`#' + user.id + '\`\n'
                + '- *Fecha* ∙ ' + formatTime('date', user.timestamp) + '\n'
                + '- *Hora* ∙ ' + formatTime('hour', user.timestamp) + '\n\n';
        }

        teks += '> sɪᴍᴘʟᴇ ᴡʜᴀᴛsᴀᴘᴘ ʙᴏᴛ ツ';

        await msg.reply(teks, { image: pp, mentions: [who] });
    }
};