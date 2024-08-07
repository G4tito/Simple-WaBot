exports.cmd = {
    name: ['kick'],
    command: ['kick'],
    category: ['moderation'],
    detail: {
        desc: 'Elimina a un usuario del grupo.',
        use: '@user'
    },
    setting: {
        isGroup: true,
        isAdmin: true,
        isBotAdmin: true
    },
    async start({ msg, participants, sock }) {
        let who = msg.quoted ? msg.quoted.sender : msg.mentions[0];
        if (!who) {
            return msg.reply('*🚩 Menciona o responde el mensaje del usuario que deseas eliminar.*');
        }
        let member = participants.find(u => u.id === who);
        if (!member) {
            return msg.reply('*🚩 El usuario no está en el grupo.*');
        }
        sock.groupParticipantsUpdate(m.chat, [who], 'remove');
        await msg.reply(`*🚩 El usuario @${who.split('@')[0]} ha sido eliminado con éxito.*`);
    }
};
