const { formatDuration } = require('../../lib/func.js');

const cooldown = 30 * 60 * 1000;

exports.cmd = {
    name: ['steal'],
    command: ['steal'],
    category: ['economy'],
    detail: {
        desc: 'Robar dinero a otro a otro usuario del grupo.',
        use: 'user'
    },
    setting: {
        isRegister: true,
        isGroup: true
    },
    async start({ msg, db }) {
        const group = db.groups.get(msg.from);
        const thief = group.users.get(msg.sender);
        const targetUser = msg.quoted ? msg.quoted.sender : msg.mentions[0];

        if (!targetUser) {
            return msg.reply('*🚩 Etiqueta al usuario del que deseas robar.*');
        }

        if (!group.users.exist(targetUser)) {
            return msg.reply('*🚩 El usuario etiquetado no está registrado en la base de datos.*');
        }

        const now = Date.now();
        if (now - thief.cooldown.steal < cooldown) {
            const timeLeft = formatDuration((thief.cooldown.steal + cooldown) - now);
            return msg.reply(`🕓〡 *Debes esperar antes de volver a robar. Vuelve dentro de*: \`${timeLeft}\``);
        }

        const stealAmount = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
        const bail = Math.floor(Math.random() * (70 - 50 + 1)) + 50;

        if (Math.random() < 0.05) {
            thief.money -= bail;
            await db.save();
            return msg.reply(`🚓〡Fallaste el robo y la policía te atrapó. Pagaste una fianza de *-${bail} 🪙 Coins*.`);
        }

        const target = group.users.get(targetUser);

        if (target.money < stealAmount) {
            return msg.reply('*🚩 El usuario no tiene suficiente dinero en su cartera.*');
        }

        thief.money += stealAmount;
        target.money -= stealAmount;
        thief.cooldown.steal = now;
        await db.save();

        await msg.reply(`🔫〡Has conseguido robar *${stealAmount} 🪙 Coins* a @${targetUser.split('@')[0]}.`, { mentions: [targetUser] });
    }
};