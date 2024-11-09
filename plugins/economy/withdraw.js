exports.cmd = {
    name: ['withdraw'],
    command: ['withdraw'],
    category: ['economy'],
    detail: {
        desc: 'Retira una cantidad de dinero del banco.'
    },
    setting: {
        isRegister: true,
        isGroup: true
    },
    async start({ msg, args, db }) {
        const group = db.groups.get(msg.from);
        const user = group.users.get(msg.sender);

        let amount;
        if (args[0] === 'all') {
            amount = user.bank;
            if (amount <= 0) {
                return msg.reply('*🚩 No tienes dinero disponible en el banco para retirar.*');
            }
        } else {
            amount = parseInt(args[0], 10);
            if (isNaN(amount) || amount <= 0) {
                return msg.reply('*🚩 La cantidad especificada no es válida.*');
            }
        }

        if (user.bank < amount) {
            return msg.reply('*🚩 No tienes suficiente dinero en el banco para realizar esta acción.*');
        }

        user.bank -= amount;
        user.money += amount;
        db.save();

        await msg.reply(`🏦〡Has retirado *${amount} 🪙 Coins* del banco. Ahora lo tienes en tu billetera.`);
    }
};