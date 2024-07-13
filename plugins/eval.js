const { inspect } = require('util');

exports.cmd = {
    name: ['eval'],
    command: ['eval'],
    category: ['advanced'],
    setting: {
        isOwner: true
    },
    async start(context) {
        const { msg, text } = context;
        if (!text) return;
        
        let result;
        try {
            let evaled = await (async () => {
                with (context) {
                    return eval(`(async () => { ${text} })()`);
                }
            })();
            if (typeof evaled !== 'string') evaled = inspect(evaled);
            result = evaled;
        } catch (e) {
            result = e;
            console.log(e);
        }
        await msg.reply(String(result));
    }
};
