const { plugins } = require('./lib/plugins.js');

const prefixList = ['/', '!', '#'];

const handler = async (msg, sock) => {
    try {
        const prefixRegex = new RegExp('^[' + prefixList.map(c => '\\' + c).join('') + ']');
        const match = msg.text.match(prefixRegex);
        const prefix = match ? match[0] : '';
        
        const trimText = msg.text.slice(prefix.length).trim();
        const command = trimText.split(/\s+/)[0].toLowerCase();
        const text = trimText.replace(command, '').trim();
        const args = text.split(/\s+/);
        
        const isCmd = command.length === 0 ? false : !!prefix;

        const { cmd: cmds } = plugins;
        if (isCmd) {
            const cmd = cmds.map(c => Object.values(c)[0]).find((v) => v.command.find((x) => x.toLowerCase() === command)) || '';
            if (cmd) {
                cmd.start({
                    msg,
                    sock,
                    
                    text,
                    args,
                    
                    prefix,
                    command,
                    
                    plugins: {
                        cmds
                    }
                });
            }
        }
    } catch (e) {
        console.error(e);
    }
};

module.exports = handler;
