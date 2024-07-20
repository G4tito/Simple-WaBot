exports.cmd = {
    name: ['demote'],
    command: ['demote'],
    category: ['moderation'],
    detail: {
        desc: 'Degrada a un usuario de administrador a miembro.',
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
            return msg.reply('🔖 | *Menciona* o *responde* al *mensaje* del usuario que deseas *degradar* a *miembro*.');
        }
        let member = participants.find(u => u.id === who);
        if (!member) {
            return msg.reply('El usuario no está en el grupo.');
        }
        await sock.groupParticipantsUpdate(m.chat, [who], 'demote');
        await msg.reply(`✔ | El usuario @${who.split('@')[0]} ha sido degradado a miembro.`);
    }
};
