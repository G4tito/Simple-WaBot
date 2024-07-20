const { exec } = require('child_process');
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
        await git.pull('origin', 'main');
        const status = await git.status();
        console.log(status);
    }
};
