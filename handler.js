const { plugins } = require('./lib/plugins.js');
const { owner, prefixList } = require('./setting.js');

const handler = async (msg, sock) => {
    try {
        const prefixRegex = new RegExp('^(' + prefixList.filter(c => c !== '').map(c => c.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")).join('|') + ')');

        const match = msg.text.match(prefixRegex);
        const prefix = match ? match[0] : '';

        const trimText = (prefix.length > 0) ? msg.text.slice(prefix.length).trim() : msg.text.trim();
        const command = trimText.split(/\s+/)[0].toLowerCase();
        const text = trimText.replace(command, '').trim();
        const args = text.split(/\s+/);

        const isCmd = command.length === 0 ? false : !!prefix || prefix === '';
        const isGroup = msg.from.endsWith('@g.us');
        const isPrivate = msg.from.endsWith('@s.whatsapp.net');
        const isOwner = [...owner.map(([number]) => number)].map(v => v?.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(msg.sender);

        const { commands } = plugins;
        if (isCmd) {
            const cmd = commands.map(c => Object.values(c)[0]).find((v) => v.command.find((x) => x.toLowerCase() === command)) || '';
            if (cmd) {
                const setting = {
				    isOwner: false,
				    isAdmin: false,
				    isGroup: false,
				    isBotAdmin: false,
		            isPrivate: false,
				    ...cmd.setting
				};

				if (setting.isGroup && !isGroup)
                    return status({
                        type: 'isGroup', msg
                    });
                if (setting.isPrivate && !isPrivate)
                    return status({
                        type: 'isPrivate', msg
                    });
                if (setting.isOwner && !isOwner)
                    return status({
                        type: 'isOwner', msg
                    });
                /*
                if (setting.isAdmin && !isAdmin)
                    return status({
                        type: 'isAdmin', msg
                    });
                if (setting.isBotAdmin && !isBotAdmin)
                    return status({
                        type: 'isBotAdmin', msg
                    });
                */

                cmd.start({
                    msg,
                    sock,

                    text,
                    args,

                    prefix,
                    command,

                    status,

                    isGroup,
                    isPrivate,
                    isOwner,

                    plugins
                });
            }
        }
    } catch (e) {
        console.error(e);
    }
};

const status = ({ type, msg }) => {
    const texts = {
        isOwner: {
            emoji: '🧃',
            desc: 'Este *comando* solo puede ser utilizado por el *creador del bot*.'
        },
        isGroup: {
            emoji: '👥',
            desc: 'Este *comando* solo puede ser utilizado en *grupos*.'
        },
        isPrivate: {
            emoji: '💬',
            desc: 'Este *comando* solo puede ser utilizado en mi *chat privado*.'
        },
        isAdmin: {
            emoji: '🔒',
            desc: 'Este *comando* solo puede ser utilizado por los *administradores del grupo*.'
        },
        isBotAdmin: {
            emoji: '🍕',
            desc: 'Debo ser *administrador* para poder ejecutar este *comando*.'
        }
    };

    const { emoji, desc } = texts[type];
    return msg.reply(`— *${type}. ${emoji}*\n\n- ${desc}`);
};

module.exports = handler;
