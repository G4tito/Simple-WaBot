const { plugins } = require('./lib/plugins.js');
const { owner, prefixList } = require('./setting.js');
const { decodeJid } = require('./lib/func.js');
const { printLog } = require('./lib/print.js');

const db = require('./lib/database.js');

const handler = async (msg, sock) => {
    try {
        const prefixRegex = new RegExp('^(' + prefixList.filter(c => c !== '').map(c => c.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")).join('|') + ')');

        const match = msg.text.match(prefixRegex);
        const prefix = match ? match[0] : '';

        const trimText = (prefix.length > 0) ? msg.text.slice(prefix.length).trim() : msg.text.trim();
        const command = trimText.split(/\s+/)[0].toLowerCase();
        const text = trimText.replace(new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '').trim();
        const args = text.split(/\s+/);

        const isGroup = msg.from.endsWith('@g.us');
        const isPrivate = msg.from.endsWith('@s.whatsapp.net');
        const isOwner = [sock.user.jid, ...owner.map(([number]) => number)].map(v => v?.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(msg.sender);

        const groupMetadata = isGroup ? await sock.groupMetadata(msg.from) : '';
        const groupName = isGroup ? groupMetadata.subject : '';
        const participants = isGroup ? groupMetadata.participants : '';
		
		const user = isGroup ? participants.find(u => decodeJid(u.id) === msg.sender) : '';
		const bot = isGroup ? participants.find(b => decodeJid(b.id) === sock.user.jid) : '';
		
		const isSuperAdmin = user?.admin === 'superadmin' || false;
        const isAdmin = isSuperAdmin || user?.admin === 'admin' || false;
		const isBotAdmin = bot?.admin === 'admin' || false;

        const { commands } = plugins;
        const cmd = commands.map(c => Object.values(c)[0]).find((v) => v.command.find((x) => x.toLowerCase() === command)) || false;
        
        let isCommand = false;
        if (cmd) {
            isCommand = true;
            
            const setting = {
				isGroup: false,
				isPrivate: false,
				isOwner: false,
				isSuperAdmin: false,
				isAdmin: false,
				isBotAdmin: false,
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
            if (setting.isAdmin && !isAdmin)
                return status({
                    type: 'isAdmin', msg
                });
            if (setting.isBotAdmin && !isBotAdmin)
                return status({
                    type: 'isBotAdmin', msg
                });

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
                    isSuperAdmin,
                    isAdmin,
                    isBotAdmin,
                    
                    groupMetadata,
                    groupName,
                    participants,
                
                    db,
                    plugins
                }).catch(async e => {
                    if (e.name) {
                        if (cmd?.setting?.error_react) await msg.react('❌');
                        await msg.reply('*' + e.name + '* : ' + e.message);
                    }
                });
        }
        
        await printLog({ msg, sock, args, command, groupName, isGroup, isCommand });
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
