exports.cmd = {
    name: ['welcome'],
    command: ['welcome'],
    category: ['moderation'],
    detail: {
        desc: 'Configura la bienvenida del grupo.',
        use: 'opts'
    },
    setting: {
        isGroup: true,
        isAdmin: true
    },
    async start({ msg, args, text, prefix, command, db }) {
        const group = db.groups.get(msg.from).setting;
        const mode = args[0]?.toLowerCase();

        if (mode === 'set') {
            if (args[1] === 'default') {
                group.welcome.msg = '';
                await db.save();
                return msg.reply('*🚩 El texto de bienvenida ha sido restablecido al predeterminado.*');
            }
            console.log(text)
            const welcomeText = text.replace('set', '').trim()
            if (!welcomeText) {
                return msg.reply('*🚩 Por favor, proporciona el texto de bienvenida.* (*default* para restaurar a predeterminado)\n\n*🍟 Opciones* ;\n\n- *@users*: Tag del usuario\'s.\n- *@group*: Nombre del grupo.\n- *@desc*: Descripción del grupo.\n\n*🍟 Ejemplo* ;\n\n*Hola*, bienvenid@\'s al grupo *@group*.\n\n@users');
            }
            group.welcome.msg = welcomeText;
            await db.save();
            return msg.reply(`*🚩 El texto de bienvenida se ha configurado a*:\n\n${welcomeText}`);
        }

        if (mode === 'help') {
            return msg.reply(`*🚩 Aquí tienes una guía sobre cómo configurar la bienvenida.*\n\n*🍟 Opciones* ;\n\n- *set*: Establece un mensaje de bienvenida. (*default* para restaurar a predeterminado)\n- *msg*: Muestra el mensaje de bienvenida actual.\n\n- *on*: Activa la bienvenida.\n- *off*: Desactiva la bienvenida.\n\n*🍟 Ejem. de Uso* ;\n\n1. ${prefix + command} < opts > [ msg ]\n2. ${prefix + command} on`);
        }

        if (mode === 'msg') {
            if (group.welcome.msg === '') {
                return msg.reply('*🚩 Mensaje de bienvenida predeterminado.*')
            }
            return msg.reply(`*🚩 Mensaje de bienvenida actual:*\n\n${group.welcome.msg}`);
        }

        if (mode === 'on' || mode === 'off') {
            const enable = mode === 'on';
            if (group.welcome.status === enable) {
                return msg.reply(`*🚩 La bienvenida ya está ${enable ? 'activada' : 'desactivada'} en este grupo.*`);
            }
            group.welcome.status = enable;
            await db.save();
            return msg.reply(`*🚩 La función de bienvenida se ha ${enable ? 'activado' : 'desactivado'} con éxito para este grupo.*`);
        }

        return msg.reply(`*🚩 Proporciona una opción.* (Escribe *${prefix + command} help* para más ayuda)`);
    }
};