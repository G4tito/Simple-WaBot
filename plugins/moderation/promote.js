exports.cmd = {
    name: ['promote'],
    command: ['promote'],
    category: ['moderation'],
    detail: {
        desc: 'Asciende a un usuario a administrador.',
        use: '@user'
    },
    setting: {
        isGroup: true,
        isAdmin: true,
        isBotAdmin: true
    },
    async start({ msg, participants }) {
        let who = msg.quoted ? msg.quoted.sender : msg.mentions[0];
        if (!who) {
            return msg.reply('🔖 | *Menciona* o *responde* al *mensaje* del *usuario* que deseas *ascender* a *administrador*.');
        }
        let member = participants.find(u => u.id === who);
        if (!member) {
            return msg.reply('El usuario no está en el grupo.');
        }
        await sock.groupParticipantsUpdate(m.chat, [who], 'promote');
        await msg.reply(`✔ | El usuario @${who.split('@')[0]} ha sido ascendido a administrador.`);
    }
};
