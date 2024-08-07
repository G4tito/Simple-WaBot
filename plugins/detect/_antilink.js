const linkRegex = /(?:chat\.whatsapp\.com\/(?:invite\/)?|whatsapp\.com\/(?:invite\/)?|whatsapp\.com\/channel\/)([0-9A-Za-z]{20,24})/i;

let userSpam = {};

exports.before = {
    async start({ msg, sock, isBaileys, isGroup, isBotAdmin, isAdmin, db }) {
        if (isBaileys || !isGroup)
            return;

        const group = db.groups.get(msg.from).setting;
        const gpLink = linkRegex.exec(msg.text);

        if (group.antilink && gpLink && !isAdmin) {
            if (isBotAdmin) {
                const linkID = await sock.groupInviteCode(msg.from);
                if (gpLink[1].includes(linkID) || gpLink[1].includes('0029Va9awpk2Jl8AQ3oiww3A')) return;
            }

            if (!userSpam[msg.from]?.[msg.sender]) {
                userSpam[msg.from] = userSpam[msg.from] || {};
                userSpam[msg.from][msg.sender] = true;

                const type = gpLink[0].includes('channel') ? '*canales*' : 'otros *grupos*';
                await msg.reply(`*🚩 AntiLink - WhatsApp.*\n\nSe detectó un enlace de *@${msg.sender.split('@')[0]}*. En este grupo está prohibido enviar *enlaces* de ${type}.`, { mentions: [msg.sender] });
            }

            if (isBotAdmin) {
                await sock.groupParticipantsUpdate(msg.from, [msg.sender], 'remove');
                await sock.sendMessage(msg.from, { delete: msg.key });
                delete userSpam[msg.from][msg.sender];
            }
        }
    }
};
