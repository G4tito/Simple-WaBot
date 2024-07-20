const simpleGit = require('simple-git');

const git = simpleGit();

exports.cmd = {
    name: ['update'],
    command: ['update', 'fix', 'gitpull'],
    category: ['script'],
    detail: {
        desc: 'Actualiza el bot a la última versión.',
    },
    setting: {
        isOwner: true
    },
    async start({ msg }) {
        try {
            await git.pull('origin', 'main');
            
            await msg.reply(JSON.stringify(git, null, 4));
            
            const status = await git.status();
            await msg.reply(JSON.stringify(status, null, 4));

            const log = await git.log();
            await msg.reply(JSON.stringify(log, null, 4));
            
            const diff = await git.diff();
            await msg.reply(JSON.stringify(diff, null, 4));
        } catch (error) {
            console.error('Error al actualizar el bot:', error);
            msg.reply('Hubo un error al intentar actualizar el bot.');
        }
    }
};
