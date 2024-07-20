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
        console.log(await git.fetch());
        let result = await git.pull('origin', 'main');
        console.log(result);
        const { created, deleted, files, deletions, insertions, summary } = result;
        
        let teks = '*Git pull results.* 🍟\n';
        
        [created, deleted, files].forEach((list, index) => {
            const titles = ['created', 'deleted', 'files'];
            if (list.length > 0) {
                teks += ` • ${titles[index].replace(/^\w/, c => c.toUpperCase())}:\n${list.map(item => `- ${item}`).join('\n')}\n`;
            }
        });
        
        ['deletions', 'insertions'].forEach(key => {
            if (Object.keys(result[key]).length > 0) {
                teks += ` • ${key.replace(/^\w/, c => c.toUpperCase())}:\n${Object.entries(result[key]).map(([file, count]) => `- ${file} | ${count}`).join('\n')}\n`;
            }
        });
        
        teks += ` • Summary:\n- ${summary.changes} changes\n- ${summary.insertions} insertions (+)\n- ${summary.deletions} deletions (-)`;

        await msg.reply(teks);
    }
};
