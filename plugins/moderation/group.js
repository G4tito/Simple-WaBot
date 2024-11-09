exports.cmd = {
    name: ['group'],
    command: ['group'],
    category: ['moderation'],
    detail: {
        desc: 'Abre o cierra el grupo.',
        use: 'open/close',
    },
    setting: {
        isGroup: true,
        isBotAdmin: true,
        isAdmin: true
    },
    async start({ msg, sock, args, groupMetadata }) {
        const group = groupMetadata;

        if (args[0] === 'open') {
            if (!group.announce) {
                return msg.reply('El *grupo* ya está *abierto*.');
            }
            await sock.groupSettingUpdate(msg.from, 'not_announcement');
            return msg.reply('🔓 Grupo *abierto* con *éxito*.');
        }

        if (args[0] === 'close') {
            if (group.announce) {
                return msg.reply('El *grupo* ya está *cerrado*.');
            }
            await sock.groupSettingUpdate(msg.from, 'announcement');
            return msg.reply('🔐 Grupo *cerrado* con *éxito*.');
        }

        return msg.reply(
            'Para *configurar* el *grupo* escribe *open* / *close*.\n\n' +
            '- [ *Open* ] ➠ Abrir el grupo.\n' +
            '- [ *Close* ] ➠ Cerrar el grupo.'
        );
    }
};