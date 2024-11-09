exports.cmd = {
    name: ['deposit'],
    command: ['deposit'],
    category: ['economy'],
    detail: {
        desc: 'Guarda una cantidad de dinero en el banco.'
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
            amount = user.money;
            if (amount <= 0) {
                return msg.reply('*🚩 No tienes dinero disponible para depositar.*');
            }
        } else {
            amount = parseInt(args[0], 10);
            if (isNaN(amount) || amount <= 0) {
                return msg.reply('*🚩 La cantidad especificada no es válida.*');
            }
        }

        if (user.money < amount) {
            return msg.reply('*🚩 No tienes suficiente dinero en tu billetera para realizar esta acción.*');
        }

        user.money -= amount;
        user.bank += amount;
        db.save();

        await msg.reply(`🏦〡Has depositado *${amount} 🪙 Coins* al banco. Ahora nadie podrá robártelo.`);
    }
};