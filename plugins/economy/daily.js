const { formatDuration } = require('../../lib/func.js');

const cooldown = 24 * 60 * 60 * 1000;

exports.cmd = {
    name: ['daily'],
    command: ['daily'],
    category: ['economy'],
    detail: {
        desc: 'Reclama tu bono diario.'
    },
    setting: {
        isRegister: true,
        isGroup: true
    },
    async start({ msg, db }) {
        const group = db.groups.get(msg.from);
        const user = group.users.get(msg.sender);

        const now = Date.now();
        if (now - user.cooldown.daily < cooldown) {
            const timeRemaining = formatDuration(cooldown - (now - user.cooldown.daily));
            return msg.reply(`🕓〡 *Aún no puedes reclamar tu bono diario. Vuelve dentro de*: \`${timeRemaining}\``);
        }

        const bonusAmount = 200;
        user.money += bonusAmount;
        user.cooldown.daily = now;

        await db.save();
        await msg.reply(`🎁〡 *Has reclamado tu bono diario de ${bonusAmount} 🪙 Coins*`);
    }
};