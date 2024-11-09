exports.cmd = {
    name: ['balance'],
    command: ['bal', 'balance'],
    category: ['economy'],
    detail: {
        desc: 'Muestra el balance de dinero del usuario.',
        use: 'user'
    },
    setting: {
        isRegister: true,
        isGroup: true
    },
    async start({ msg, db }) {
        const group = db.groups.get(msg.from);
        const targetUser = msg.mentions[0] || msg.sender;
        const user = group.users.get(targetUser);

        if (!group.users.exist(targetUser)) {
            return msg.reply('*🚩 El usuario mencionado no está registrado en la base de datos.*');
        }

        const balanceMessage = `*Balance* de *@${targetUser.split('@')[0]}* ;\n\n`
            + `\t◦  *Billetera*:\n\t\t${user.money} 🪙 Coins\n\n`
            + `\t◦  *Banco*:\n\t\t${user.bank} 🪙 Coins`;

        await msg.reply(balanceMessage, { mentions: [targetUser] });
    }
};
