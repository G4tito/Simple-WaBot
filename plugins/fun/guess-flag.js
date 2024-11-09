const game = require('../../lib/game/guess-flag.js');
const { formatDuration } = require('../../lib/func.js');

const data = {
    reward: 25, // Exp
    cooldown: 3 * 60 * 1000 // 3 minutos
};

exports.cmd = {
    name: ['guess-flag'],
    command: ['guess-flag', 'guessflag'],
    category: ['fun'],
    detail: {
        desc: 'Adivina el país de la bandera mostrada.'
    },
    setting: {
        isRegister: true,
        isGroup: true
    },
    async start({ msg }) {
        const isExist = await game.exist(msg.from);
        if (isExist) {
            return msg.reply('*🚩 Ya hay una sesión de juego activa en este grupo.*');
        }

        const flag = await game.flag();
        const message = await msg.reply(`*Guess - Flag*. 🎮\n\n- Adivina el país de esta bandera.\n- *Bandera*: ${flag.emoji}\n\n- *Recompensa*: +${data.reward} Exp\n- *Tiempo*: ${formatDuration(data.cooldown)}`);

        await game.save(message.key.id, msg.from, flag);

        setTimeout(async () => {
            const session = await game.get(msg.from, message.key.id);
            if (session) {
                await msg.reply(`⏱ | El *tiempo* ha *terminado*. La bandera es de *${session.flag.name[0]}*.`, { quoted: message });
                await game.del(msg.from);
            }
        }, data.cooldown);
    }
};

exports.before = {
    async start({ msg, isBaileys, db }) {
        if (isBaileys) return;

        if (msg.text && msg.quoted && msg.quoted.id) {
            const isExist = await game.exist(msg.from);
            if (isExist) {
                const session = await game.get(msg.from, msg.quoted.id);
                if (session) {
                    session.attempts++;
                    const answer = msg.text.trim().toLowerCase();
                    const correctAnswers = session.flag.name.map(a => a.toLowerCase());

                    if (correctAnswers.includes(answer)) {
                        const group = db.groups.get(msg.from);
                        const user = group.users.get(msg.sender);
                        await msg.reply(`✅ | *Correcto*! La bandera es de *${session.flag.name[0]}*.`);
                        await game.del(msg.from);
                        user.exp += data.reward * 1;
                        await db.save();
                    } else if (session.attempts >= 3) {
                        await msg.reply(`❌ | *Incorrecto*. Has alcanzado el *máximo* de *intentos*. La respuesta es *${session.flag.name[0]}*.`);
                        await game.del(msg.from);
                    } else {
                        await msg.reply(`❌ | *Incorrecto*. Inténtalo de nuevo. Intentos restantes: *${3 - session.attempts}*`);
                    }
                }
            }
        }
    }
};