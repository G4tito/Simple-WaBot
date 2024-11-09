exports.cmd = {
    name: ['transfer'],
    command: ['transfer', 'pay'],
    category: ['economy'],
    detail: {
        desc: 'Transfiere una cantidad de dinero a otro usuario.',
        use: 'opts',
    },
    setting: {
        isRegister: true,
        isGroup: true,
    },
    async start({ msg, args, prefix, command, db }) {
        const group = db.groups.get(msg.from);
        const sender = group.users.get(msg.sender);
        const targetUser = msg.mentions[0];

        if (!targetUser) {
            return msg.reply(`*🚩 Etiqueta al usuario al que deseas transferirle dinero.*\n\n  🍟 *Ejem. de Uso* ;\n\n1. ${prefix + command} < user + money >\n2. ${prefix + command} @user 700`);
        }

        if (!group.users.exist(targetUser)) {
            return msg.reply('*🚩 El usuario etiquetado no está registrado en la base de datos.*');
        }

        const target = group.users.get(targetUser);
        const amount = parseInt(args[1], 10);

        if (isNaN(amount) || amount <= 0) {
            return msg.reply('*🚩 La cantidad especificada no es válida.*');
        }

        if (sender.bank < amount) {
            return msg.reply('*🚩 No tienes suficiente dinero en el banco para realizar la transferencia.*');
        }

        sender.bank -= amount;
        target.bank += amount;
        await db.save();

        await msg.reply(`💸〡Has transferido *${amount} 🪙 Coins* a @${targetUser.split('@')[0]}.`);
    },
};