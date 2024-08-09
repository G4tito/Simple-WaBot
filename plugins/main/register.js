const moment = require('moment-timezone');
const { generateCode, formatTime } = require('../../lib/func.js');
const { timeZone } = require('../../setting.js');

exports.cmd = {
    name: ['register'],
    command: ['reg', 'register'],
    category: ['main'],
    detail: {
        desc: 'Regístrate y obtén acceso a todos los comandos disponibles.',
        use: '@text=[username]'
    },
    async start({ msg, sock, text, prefix, command, isRegistered, db }) {
        if (isRegistered) {
            return msg.reply('*🚩 Ya estás registrado.*');
        }

        if (!text) {
            return msg.reply(`*🚩 Por favor, ingresa tu nombre de usuario para proceder con el registro.*\n\n*🍟 Ejem. de Uso* ;\n\n1. ${prefix + command} < username >\n2. ${prefix + command} Andrés_74`);
        }

        const validation = validateUsername(text);
        if (!validation.valid) {
            return msg.reply(`*🚩 ${validation.message}*`);
        }

        let code;
        let isUniqueCode = false;
        while (!isUniqueCode) {
            code = await generateCode(5);
            if (!Object.values(db.users.list()).some(user => user.id === code)) {
                isUniqueCode = true;
            }
        }

        let profilePicture = await sock.profilePictureUrl(msg.sender, 'image').catch(() => global.img.avatar);

        const responseText = `—  *USER*  〤  *REGISTER*` + '\n\n'
            + `- *Tag* ∙ @${msg.sender.split('@')[0]}` + '\n'
            + `- *User* ∙ ${text}` + '\n'
            + `- *ID* ∙ \`#${code}` + '\`\n\n'
            + `- *Fecha* ∙ ${formatTime('date')}` + '\n'
            + `- *Hora* ∙ ${formatTime('hour')}` + '\n\n'
            + `Escribe *${prefix}profile* para ver tu perfil.`;

        await msg.reply(responseText, { image: profilePicture, mentions: [msg.sender] });

        db.users.add(msg.sender, {
            name: text,
            id: code,
            time: moment().tz(timeZone).valueOf()
        });
        db.save();
    }
};

function validateUsername(username) {
    const minLength = 3;
    const maxLength = 20;
    const usernameRegex = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ_]+$/;

    if (typeof username !== 'string') {
        return { valid: false, message: 'El nombre de usuario debe ser una cadena de texto.' };
    }

    if (username.length < minLength) {
        return { valid: false, message: `El nombre de usuario debe tener al menos ${minLength} caracteres.` };
    }

    if (username.length > maxLength) {
        return { valid: false, message: `El nombre de usuario no puede tener más de ${maxLength} caracteres.` };
    }

    if (!usernameRegex.test(username)) {
        return { valid: false, message: 'El nombre de usuario solo puede contener letras, números y guiones bajos.' };
    }

    return { valid: true };
}