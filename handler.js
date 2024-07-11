const prefix = '/';

const handler = async (msg, sock) => {
    try {
        if (!msg.text.startsWith(prefix))
            return;

        const args = msg.text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'alive') {
            msg.reply('Hello there!');
        }
    } catch (e) {
        console.error(e);
    }
}

module.exports = handler;
