const { defaultPrefix } = require('../../setting.js');

exports.cmd = {
    name: ['prefix'],
    command: ['prefix'],
    category: ['utility'],
    detail: {
        desc: 'Administra los prefijos del bot.',
        use: 'opts',
    },
    setting: {
        isOwner: true
    },
    async start({ msg, sock, args, text, prefix, command, db }) {
        if (!text) {
            return msg.reply(
                `*🚩 Proporciona una opción.* (Escribe *${prefix + command} help* para más ayuda)`
            );
        }

        const action = args[0].toLowerCase();
        const setting = db.settings.get(sock.user.jid);

        const formatPrefix = (p) => (p.trim() === '' ? '`­ ­` (space)' : p);
        const prefixExists = (arr, p) =>
            arr.some(
                (item) =>
                    item === p ||
                    (p === '' && item === '') ||
                    (p.trim() === '' && item.trim() === '')
            );

        switch (action) {
            case 'help': {
                const helpText = 
                    `*🚩 Aquí tienes una guía sobre cómo gestionar los prefijos del bot.*\n\n` +
                    `*🍟 Opciones* ;\n\n` +
                    `- *add*: Añade prefijos.\n` +
                    `- *del*: Elimina prefijos existentes.\n` +
                    `- *set*: Establece prefijos.\n` +
                    `- *default*: Restaura el prefijo predeterminado.\n` +
                    `- *list*: Muestra los prefijos actuales.\n\n` +
                    `*🍟 Ejem. de Uso* ;\n\n` +
                    `- ${prefix + command} < opts > [ prefix ]\n` +
                    `- ${prefix + command} add #`;
                return msg.reply(helpText);
            }

            case 'list': {
                const listPrefixes = setting.prefix
                    .map((p) => `- ${formatPrefix(p)}`)
                    .join('\n');
                return msg.reply(`*🚩 Prefijos actuales* :\n\n${listPrefixes}`);
            }

            case 'add': {
                if (!args[1]) {
                    return msg.reply(
                        `*🚩 Proporciona uno o varios prefijos para añadir.* (Si son varios usa “ *|* ” para separarlos)`
                    );
                }

                const prefixes = args
                    .slice(1)
                    .join(' ')
                    .split('|')
                    .map(p => p.trim())
                    .filter(p => p !== '')
                    .map(p => p === '\\t' ? '' : p);

                if (prefixes.length === 0) {
                    return msg.reply(
                        `*🚩 Proporciona uno o varios prefijos válidos para añadir.* (Si son varios usa “ *|* ” para separarlos)`
                    );
                }

                const processed = { success: [], failed: [] };
                prefixes.forEach((p) => {
                    if (!prefixExists(setting.prefix, p)) {
                        setting.prefix.push(p);
                        processed.success.push(p);
                    } else {
                        processed.failed.push(p);
                    }
                });

                let addText = `*🚩 Lista de prefijos.* [ ADD ]`;
                if (processed.success.length) {
                    addText += '\n\n • *Añadidos*:\n' +
                        processed.success
                            .map((p) => `- ${formatPrefix(p)}`)
                            .join('\n');
                }
                if (processed.failed.length) {
                    addText += '\n\n • *Existentes*:\n' +
                        processed.failed
                            .map((p) => `- ${formatPrefix(p)}`)
                            .join('\n');
                }
                await db.save();
                return msg.reply(addText);
            }

            case 'del': {
                if (!args[1]) {
                    return msg.reply(
                        `*🚩 Proporciona uno o varios prefijos para eliminar.* (Si son varios usa “ *|* ” para separarlos)`
                    );
                }

                const prefixes = args
                    .slice(1)
                    .join(' ')
                    .split('|')
                    .map(p => p.trim())
                    .filter(p => p !== '')
                    .map(p => p === '\\t' ? '' : p);

                if (prefixes.length === 0) {
                    return msg.reply(
                        `*🚩 Proporciona uno o varios prefijos válidos para eliminar.* (Si son varios usa “ *|* ” para separarlos)`
                    );
                }

                const processed = { success: [], failed: [] };
                prefixes.forEach((p) => {
                    if (prefixExists(setting.prefix, p)) {
                        setting.prefix = setting.prefix.filter(
                            (prefix) => prefix !== p && prefix.trim() !== p.trim()
                        );
                        processed.success.push(p);
                    } else {
                        processed.failed.push(p);
                    }
                });

                let delText = `*🚩 Lista de prefijos.* [ DEL ]`;
                if (processed.success.length) {
                    delText += '\n\n • *Eliminados*:\n' +
                        processed.success
                            .map((p) => `- ${formatPrefix(p)}`)
                            .join('\n');
                }
                if (processed.failed.length) {
                    delText += '\n\n • *No encontrados*:\n' +
                        processed.failed
                            .map((p) => `- ${formatPrefix(p)}`)
                            .join('\n');
                }
                await db.save();
                return msg.reply(delText);
            }

            case 'set': {
                if (!args[1]) {
                    return msg.reply(
                        `*🚩 Proporciona uno o varios prefijos para establecer.* (Si son varios usa “ *|* ” para separarlos)`
                    );
                }

                const prefixes = args
                    .slice(1)
                    .join(' ')
                    .split('|')
                    .map(p => p.trim())
                    .filter(p => p !== '')
                    .map(p => p === '\\t' ? '' : p);
                
                if (prefixes.length === 0) {
                    return msg.reply(
                        `*🚩 Proporciona uno o varios prefijos válidos para establecer.* (Si son varios usa “ *|* ” para separarlos)`
                    );
                }
                
                setting.prefix = prefixes;
                await db.save();
                return msg.reply(
                    `*🚩 Prefijo cambiado* :\n\n${prefixes
                        .map((p) => `- ${formatPrefix(p)}`)
                        .join('\n')}`
                );
            }

            case 'default': {
                setting.prefix = defaultPrefix;
                await db.save();
                return msg.reply('*🚩 Prefijo cambiado al valor predeterminado.*');
            }

            default: {
                return msg.reply(
                    `*🚩 Opción no válida.* (Escribe *${prefix + command} help* para más ayuda)`
                );
            }
        }
    },
};