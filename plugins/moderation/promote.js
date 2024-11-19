exports.cmd = {
    name: ['promote'],
    command: ['promote'],
    category: ['moderation'],
    detail: {
        desc: 'Promove a un usuario de miembro a administrador.',
        use: 'user'
    },
    setting: {
        isGroup: true,
        isAdmin: true,
        isBotAdmin: true
    },
    async start({ msg, participants, sock }) {
        let who = msg.quoted ? msg.quoted.sender : msg.mentions[0];
        if (!who) {
            return msg.reply('*🚩 Menciona o responde al mensaje del usuario que deseas promover.*');
        }

        let member = participants.find(u => u.id === who);
        if (!member) {
            return msg.reply('*🚩 El usuario no está en el grupo.*');
        }

        await sock.groupParticipantsUpdate(msg.from, [who], 'promote');
        await msg.reply(`*🚩 El usuario @${who.split('@')[0]} ha sido promovido con éxito.*`, { mentions: [who] });
    }
};