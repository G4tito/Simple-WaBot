const { getRandom } = require('../../lib/func.js');

exports.cmd = {
    name: ['shipping'],
    command: ['shipping', 'ship'],
    category: ['fun'],
    detail: {
        desc: 'Empareja dos participantes al azar.',
    },
    setting: {
        isGroup: true
    },
    async start({ msg, participants }) {
        let users = participants.map(v => v.id);

        let a, b;
        do {
            a = getRandom(users);
            b = getRandom(users);
        } while (a === b);

        await msg.reply(`@${a.split('@')[0]} ❤ @${b.split('@')[0]}`, { mentions: [a, b] });
    }
};
