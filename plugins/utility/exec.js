const { exec } = require('child_process');

exports.cmd = {
    name: ['exec'],
    command: ['exec'],
    category: ['utility'],
    detail: {
        desc: 'Ejecutor de funciones en terminal.',
        use: 'func.'
    },
    setting: {
        isOwner: true
    },
    async start({ msg, text }) {
        if (!text) return;
        
        exec(text, (err, stdout) => {
            if (err) return msg.reply(String(err));
            if (stdout) return msg.reply(stdout.trim());
        });
    }
};