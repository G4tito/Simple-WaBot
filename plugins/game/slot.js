const { formatDuration } = require('../../lib/func.js');

const data = {
    minBet: 50,
    maxBet: 500,
    cooldown: 3000,
    emojis: [
        '🍇', '🍈', '🍉', '🍊', '🍋', '🍋‍🟩', '🍌', '🍍', '🥭',
        '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅',
        '🫒', '🥥'
    ]
};

let lastSlotTimestamp = 0;

exports.cmd = {
    name: ['slot'],
    command: ['slot'],
    category: ['game'],
    detail: {
        desc: 'Juega al tragamonedas.',
        use: 'money'
    },
    setting: {
        isRegister: true,
        isGroup: true
    },
    async start({ text, msg, prefix, command, db }) {
        if (!text || isNaN(text)) {
            return msg.reply(`*🚩 Por favor, ingresa el monto de tu apuesta.*\n\n*🍟 Ejemplo de Uso* ;\n\n1. ${prefix + command} < dinero >\n2. ${prefix + command} 70`);
        }

        let bet = parseInt(text);
        let group = db.groups.get(msg.from);
        let user = group.users.get(msg.sender);

        if (Date.now() - lastSlotTimestamp < data.cooldown) {
            return msg.reply(`🕓 | Espera *${formatDuration((user.lastslot + data.cooldown) - Date.now())}*`);
        }

        if (bet < data.minBet) {
            return msg.reply(`*🚩 La apuesta mínima es ${data.minBet} de dinero.*`);
        }
        if (user.money < bet) {
            return msg.reply('*🚩 No tienes suficientes monedas para la apuesta.*');
        }
        if (bet > data.maxBet) {
            return msg.reply(`*🚩 La apuesta máxima es ${data.maxBet} de dinero.*`);
        }

        const generateRow = () => 
            Array.from({ length: 3 }, () => data.emojis[Math.floor(Math.random() * data.emojis.length)]);

        const result = [
            generateRow(),
            generateRow(),
            generateRow()
        ];

        const getSlotOutcome = () => {
            let hasFullMatch = false;
            let hasPartialMatch = false;

            for (const row of result) {
                if (row[0] === row[1] && row[1] === row[2]) {
                    hasFullMatch = true;
                    break;
                }
            }

            if (hasFullMatch) {
                user.exp += bet * 2;
                return `Ganaste! 🎉\n> *+${bet} exp*`;
            }

            hasPartialMatch = result.some(row => row[0] === row[1] || row[0] === row[2] || row[1] === row[2]);

            if (hasPartialMatch) {
                const exp = bet * 1.2
                user.exp += exp;
                return `Parcial ✨\n> *+${exp} exp*`;
            }

            user.money -= bet;
            return `Perdiste 🔻\n> *-${bet} dinero*`;
        };

        const outcome = getSlotOutcome();
        lastSlotTimestamp = Date.now();
        await db.save();

        const separator = ' : ';
        const resultLines = result.map(row => row.join(separator)).join('\n');

        const teks = `🎰  |  *SLOTS*\n`
            + `──────\n`
            + `${resultLines}\n`
            + `──────\n`
            + `${outcome}`;
        
        await msg.reply(teks);
    }
};
