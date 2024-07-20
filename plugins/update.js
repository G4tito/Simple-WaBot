const { exec } = require('child_process');

exports.cmd = {
    name: ['update'],
    command: ['update', 'fix'],
    category: ['none'],
    detail: {
        desc: 'Actualiza el bot a la última versión.',
    },
    async start({ msg }) {
        exec('git pull', async (error, stdout, stderr) => {
            if (error) {
                return msg.reply(String(error));
            }
            if (stderr) {
                return msg.reply(String(stderr).trim());
            }
            await msg.reply(String(stdout).trim());
        });
    }
};
