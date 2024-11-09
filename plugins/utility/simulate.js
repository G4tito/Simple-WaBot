const { groupParticipantsUpdate } = require('../../lib/event/group.js');

exports.cmd = {
    name: ['simulate'],
    command: ['simulate'],
    category: ['utility'],
    detail: {
        desc: 'Simula eventos.',
        use: 'event'
    },
    setting: {
        isOwner: true,
        isGroup: true
    },
    async start({ msg, sock, args, prefix, command }) {
        if (!args[0]) {
            return msg.reply(`*🚩 Por favor, ingresa un evento para simular.* (Escribe *${prefix + command} list* para ver la lista)`);
        }

        if (args[0] === 'list') {
            return msg.reply(`*🚩 Eventos disponibles*:\n\n- welcome`);
        }

        const event = args[0].toLowerCase();

        const who = msg.quoted
            ? [msg.quoted.sender]
            : (msg.mentions && msg.mentions.length > 0)
                ? msg.mentions
                : [msg.sender];

        switch (event) {
            case 'welcome': {
                const data = {
                    id: msg.from,
                    author: msg.sender,
                    participants: who,
                    action: 'add',
                    simulate: true
                };
                await groupParticipantsUpdate(data, sock);
                break;
            }
            default: {
                msg.reply(`*🚩 El evento especificado no existe.* (Escribe *${prefix + command} list* para ver la lista)`);
                break;
            }
        }
    }
};