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
        isBotAdmin: true
    },
    async start({ msg, sock, args, groupMetadata }) {
        let group = groupMetadata;
        if (args[0] === 'open') {
            if (!group.announce) {
                return msg.reply('El *grupo* ya está *abierto*.');
            }
            await sock.groupSettingUpdate(msg.from, 'not_announcement');
            await msg.reply('🔓 Grupo *abierto* con *Éxito*.');
        } else if (args[0] === 'close') {
            if (group.announce) {
                return msg.reply('El *grupo* ya está *cerrado*.');
            }
            await sock.groupSettingUpdate(msg.from, 'announcement');
            await msg.reply('🔐 Grupo *cerrado* con *Éxito*.');
        } else {
            await msg.reply('Para *configurar* el *grupo* escriba *open* / *close*.\n\n- [ *Open* ] ➠ Abrir el grupo.\n- [ *Close* ] ➠ Cerrar el grupo.');
        }
    }
}
