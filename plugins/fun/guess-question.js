const game = require('../../lib/game/guess-question.js');
const { formatDuration } = require('../../lib/func.js');

const data = {
    reward: 25, // Exp
    cooldown: 3 * 60 * 1000 // 3 minutos
};

exports.cmd = {
    name: ['guess-question'],
    command: ['guess-question', 'guessquestion'],
    category: ['fun'],
    detail: {
        desc: 'Adivina la respuesta correcta a la pregunta mostrada.'
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

        const question = await game.question();
        const options = question.options.map((opt, index) => `${index + 1}. ${opt}`).join('\n');
        const message = await msg.reply(`*Guess Question* 🎳 ;\n\n- *Pregunta*: ${question.text}\n\n${options}\n\n- *Recompensa*: +${data.reward} Exp\n- *Tiempo*: ${formatDuration(data.cooldown)}`);

        await game.save(message.key.id, msg.from, question);

        setTimeout(async () => {
            const session = await game.get(msg.from, message.key.id);
            if (session) {
                await msg.reply(`⏱〡 *El tiempo ha terminado*. La respuesta es: *${session.question.correct}*`, { quoted: message });
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
                    const answerIndex = parseInt(msg.text.trim(), 10) - 1;
                    const correctAnswerIndex = session.question.options.indexOf(session.question.correct);

                    if (answerIndex === correctAnswerIndex) {
                        const group = db.groups.get(msg.from);
                        const user = group.users.get(msg.sender);
                        await msg.reply(`✔️ *Correcto*! La respuesta es: *${session.question.correct}*`);
                        await game.del(msg.from);
                        user.exp += data.reward * 1;
                        await db.save();
                    } else {
                        await msg.reply(`❌ *Incorrecto*. La respuesta es: *${session.question.correct}*`);
                        await game.del(msg.from);
                    }
                }
            }
        }
    }
};